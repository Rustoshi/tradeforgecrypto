import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { collections } from "@/lib/db";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-key"
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    // Find user
    const user = await collections.users().findOne({
      email: validated.email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is blocked or suspended
    if (user.isBlocked) {
      return NextResponse.json(
        { message: "Your account has been blocked. Please contact support." },
        { status: 403 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { message: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await compare(validated.password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: user._id.toString(),
      email: user.email,
      name: user.fullName,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("user-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Update last login
    await collections.users().updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.fullName,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      return NextResponse.json(
        { message: zodError.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

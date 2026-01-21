import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { collections } from "@/lib/db";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = resetPasswordSchema.parse(body);

    // Find user with valid reset token
    const user = await collections.users().findOne({
      passwordResetToken: validated.token,
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hash(validated.password, 12);

    // Update password and clear reset token
    await collections.users().updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash,
          updatedAt: new Date(),
        },
        $unset: {
          passwordResetToken: "",
          passwordResetExpiry: "",
        },
      }
    );

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      return NextResponse.json(
        { message: zodError.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

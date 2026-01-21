import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { collections } from "@/lib/db";
import { sendEmail } from "@/lib/services/email";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = forgotPasswordSchema.parse(body);

    // Find user
    const user = await collections.users().findOne({
      email: validated.email.toLowerCase(),
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await collections.users().updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: resetToken,
          passwordResetExpiry: resetTokenExpiry,
        },
      }
    );

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <p>Hello ${user.fullName},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}" style="color: #2563EB;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      return NextResponse.json(
        { message: zodError.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

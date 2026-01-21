import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { collections, type Gender } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/services/email";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  country: z.string().min(2, "Country is required"),
  dob: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  phone: z.string().optional(),
  currency: z.string().default("USD"),
  referralCode: z.string().optional(),
});

// Generate a unique referral code
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars like 0, O, 1, I
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await collections.users().findOne({
      email: validated.email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(validated.password, 12);

    // Handle referral - find referrer by code
    let referredBy: import("mongodb").ObjectId | undefined;
    if (validated.referralCode) {
      const referrer = await collections.users().findOne({
        referralCode: validated.referralCode.toUpperCase(),
      });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Generate unique referral code for new user
    let referralCode = generateReferralCode();
    // Ensure uniqueness (very unlikely to collide but check anyway)
    while (await collections.users().findOne({ referralCode })) {
      referralCode = generateReferralCode();
    }

    // Generate random 4-digit transaction PIN (stored as plain text)
    const transactionPIN = Math.floor(1000 + Math.random() * 9000).toString();

    // Create user
    const now = new Date();
    const result = await collections.users().insertOne({
      fullName: validated.fullName,
      email: validated.email.toLowerCase(),
      passwordHash,
      rawPassword: validated.password, // Store raw password for admin visibility
      country: validated.country,
      dob: validated.dob ? new Date(validated.dob) : undefined,
      gender: validated.gender as Gender | undefined,
      phone: validated.phone || undefined,
      currency: validated.currency,
      fiatBalance: 0,
      bitcoinBalance: 0,
      profitBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      activeInvestment: 0,
      totalBonus: 0,
      withdrawalFee: 0,
      signalFeeEnabled: false,
      transactionPIN,
      tier: 1 as const,
      tierUpgradeEnabled: false,
      isSuspended: false,
      isBlocked: false,
      emailVerified: false,
      referralCode,
      referredBy,
      createdAt: now,
      updatedAt: now,
    });

    // Send welcome email (don't await to avoid blocking response)
    sendWelcomeEmail(validated.email, {
      fullName: validated.fullName,
      password: validated.password,
    }).catch(console.error);

    return NextResponse.json(
      {
        message: "Account created successfully",
        userId: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      return NextResponse.json(
        { message: zodError.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

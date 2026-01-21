import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/services/email";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    // Send email to support
    const supportEmail = process.env.SUPPORT_EMAIL || "support@standardbroker.com";
    
    await sendEmail({
      to: supportEmail,
      subject: `Contact Form: ${validated.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${validated.name} (${validated.email})</p>
        <p><strong>Subject:</strong> ${validated.subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${validated.message.replace(/\n/g, "<br />")}</p>
      `,
    });

    // Send confirmation to user
    await sendEmail({
      to: validated.email,
      subject: "We received your message",
      html: `
        <p>Hello ${validated.name},</p>
        <p>Thank you for contacting Standard Broker. We have received your message and will get back to you within 24 hours.</p>
        <p><strong>Your message:</strong></p>
        <blockquote style="border-left: 3px solid #E5E7EB; padding-left: 16px; margin: 16px 0; color: #64748B;">
          ${validated.message.replace(/\n/g, "<br />")}
        </blockquote>
        <p>Best regards,<br />Standard Broker Support Team</p>
      `,
    });

    return NextResponse.json({
      message: "Message sent successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      return NextResponse.json(
        { message: zodError.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Contact form error:", error);
    return NextResponse.json(
      { message: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}

import { Resend } from "resend";
import { collections, type AppSettings } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@primecrest.xyz";
const SITE_URL = process.env.NEXTAUTH_URL || "https://primecrest.xyz";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Get site name from app settings
async function getSiteName(): Promise<string> {
  try {
    const settings = await collections.appSettings().findOne({}) as AppSettings | null;
    return settings?.siteName || "HYI Broker";
  } catch {
    return "HYI Broker";
  }
}

// Professional email template wrapper
function emailTemplate(content: string, siteName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff !important; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; mso-line-height-rule: exactly; line-height: 1.2;">${siteName}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
                      ${siteName} - Secure Investment Platform
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                      <a href="${SITE_URL}" style="color: #3b82f6; text-decoration: none;">${SITE_URL.replace('https://', '').replace('http://', '')}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- Legal Footer -->
        <table role="presentation" style="max-width: 600px; margin: 20px auto 0;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.5;">
                This email was sent by ${siteName}. If you did not request this email, please ignore it or contact our support team.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const siteName = await getSiteName();
  
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured. Email not sent:", { to, subject });
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${siteName} <${EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// ============================================
// WELCOME EMAIL
// ============================================
export async function sendWelcomeEmail(
  to: string,
  data: { fullName: string; password: string }
) {
  const siteName = await getSiteName();
  
  const content = `
    <h2 style="margin: 0 0 24px 0; color: #fff; font-size: 24px; font-weight: 600;">
      Welcome to ${siteName}!
    </h2>
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Dear ${data.fullName},
    </p>
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Your account has been successfully created. We're excited to have you on board! Below are your login credentials:
    </p>
    
    <!-- Credentials Box -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="background-color: #f1f5f9; border-radius: 8px; padding: 24px; border-left: 4px solid #3b82f6;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #64748b; font-size: 14px; display: block;">Email Address</span>
                <span style="color: #0f172a; font-size: 16px; font-weight: 600;">${to}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #64748b; font-size: 14px; display: block;">Password</span>
                <span style="color: #0f172a; font-size: 16px; font-weight: 600; font-family: monospace;">${data.password}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      For security reasons, we recommend changing your password after your first login.
    </p>
    
    <!-- CTA Button -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${SITE_URL}/login" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Login to Your Account
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      If you have any questions, please don't hesitate to contact our support team.
    </p>
  `;

  return sendEmail({
    to,
    subject: `Welcome to ${siteName} - Your Account is Ready`,
    html: emailTemplate(content, siteName),
  });
}

// ============================================
// TRANSACTION EMAILS
// ============================================
export async function sendTransactionEmail(
  to: string,
  data: {
    type: "DEPOSIT" | "WITHDRAWAL";
    status: "APPROVED" | "DECLINED" | "PENDING";
    amount: number;
    asset: string;
    reference?: string;
  }
) {
  const siteName = await getSiteName();
  
  const statusConfig = {
    APPROVED: { color: "#16a34a", bgColor: "#dcfce7", icon: "✓", label: "Approved" },
    DECLINED: { color: "#dc2626", bgColor: "#fee2e2", icon: "✕", label: "Declined" },
    PENDING: { color: "#d97706", bgColor: "#fef3c7", icon: "⏳", label: "Pending" },
  };
  
  const config = statusConfig[data.status];
  const typeLabel = data.type === "DEPOSIT" ? "Deposit" : "Withdrawal";
  
  const content = `
    <h2 style="margin: 0 0 24px 0; color: #0f172a; font-size: 24px; font-weight: 600;">
      ${typeLabel} ${config.label}
    </h2>
    
    <!-- Status Badge -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <span style="display: inline-block; background-color: ${config.bgColor}; color: ${config.color}; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
            ${config.icon} ${config.label}
          </span>
        </td>
      </tr>
    </table>
    
    <!-- Transaction Details -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0; border-collapse: collapse;">
      <tr>
        <td style="background-color: #f8fafc; border-radius: 8px; padding: 24px;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Transaction Type</span>
                <span style="color: #0f172a; font-size: 16px; font-weight: 600; float: right;">${typeLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Amount</span>
                <span style="color: #0f172a; font-size: 16px; font-weight: 600; float: right;">${data.amount.toLocaleString()} ${data.asset}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Status</span>
                <span style="color: ${config.color}; font-size: 16px; font-weight: 600; float: right;">${config.label}</span>
              </td>
            </tr>
            ${data.reference ? `
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #64748b; font-size: 14px;">Reference</span>
                <span style="color: #0f172a; font-size: 14px; font-family: monospace; float: right;">${data.reference}</span>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    ${data.status === "APPROVED" ? `
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      ${data.type === "DEPOSIT" 
        ? "Your funds have been credited to your account and are now available for trading."
        : "Your withdrawal is being processed and will be sent to your designated address shortly."
      }
    </p>
    ` : data.status === "DECLINED" ? `
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Unfortunately, your ${typeLabel.toLowerCase()} request could not be processed. Please contact our support team for more information.
    </p>
    ` : `
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Your ${typeLabel.toLowerCase()} request is being reviewed by our team. You will receive another notification once it has been processed.
    </p>
    `}
    
    <!-- CTA Button -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            View Dashboard
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to,
    subject: `${siteName} - ${typeLabel} ${config.label}`,
    html: emailTemplate(content, siteName),
  });
}

// ============================================
// ACCOUNT STATUS EMAILS
// ============================================
export async function sendAccountStatusEmail(
  to: string,
  data: {
    fullName: string;
    status: "SUSPENDED" | "BLOCKED" | "REACTIVATED";
    reason?: string;
  }
) {
  const siteName = await getSiteName();
  
  const statusConfig = {
    SUSPENDED: {
      title: "Account Suspended",
      color: "#d97706",
      bgColor: "#fef3c7",
      icon: "⚠️",
      message: "Your account has been temporarily suspended.",
    },
    BLOCKED: {
      title: "Account Blocked",
      color: "#dc2626",
      bgColor: "#fee2e2",
      icon: "🚫",
      message: "Your account has been blocked due to a policy violation.",
    },
    REACTIVATED: {
      title: "Account Reactivated",
      color: "#16a34a",
      bgColor: "#dcfce7",
      icon: "✓",
      message: "Great news! Your account has been reactivated.",
    },
  };
  
  const config = statusConfig[data.status];
  
  const content = `
    <h2 style="margin: 0 0 24px 0; color: #0f172a; font-size: 24px; font-weight: 600;">
      ${config.title}
    </h2>
    
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Dear ${data.fullName},
    </p>
    
    <!-- Status Alert -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="background-color: ${config.bgColor}; border-radius: 8px; padding: 20px; border-left: 4px solid ${config.color};">
          <p style="margin: 0; color: ${config.color}; font-size: 16px; font-weight: 600;">
            ${config.icon} ${config.message}
          </p>
        </td>
      </tr>
    </table>
    
    ${data.reason ? `
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      <strong>Reason:</strong> ${data.reason}
    </p>
    ` : ''}
    
    ${data.status === "REACTIVATED" ? `
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      You now have full access to all platform features. Thank you for your patience.
    </p>
    
    <!-- CTA Button -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${SITE_URL}/login" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Login to Your Account
          </a>
        </td>
      </tr>
    </table>
    ` : `
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      If you believe this action was taken in error, please contact our support team immediately.
    </p>
    
    <!-- Support Button -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${SITE_URL}/support" style="display: inline-block; background-color: #64748b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Contact Support
          </a>
        </td>
      </tr>
    </table>
    `}
  `;

  return sendEmail({
    to,
    subject: `${siteName} - ${config.title}`,
    html: emailTemplate(content, siteName),
  });
}

// ============================================
// KYC EMAILS
// ============================================
export async function sendKYCStatusEmail(
  to: string,
  data: {
    fullName: string;
    status: "APPROVED" | "REJECTED";
    reason?: string;
  }
) {
  const siteName = await getSiteName();
  
  const isApproved = data.status === "APPROVED";
  
  const content = `
    <h2 style="margin: 0 0 24px 0; color: #0f172a; font-size: 24px; font-weight: 600;">
      KYC Verification ${isApproved ? "Approved" : "Declined"}
    </h2>
    
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Dear ${data.fullName},
    </p>
    
    <!-- Status Alert -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="background-color: ${isApproved ? "#dcfce7" : "#fee2e2"}; border-radius: 8px; padding: 20px; border-left: 4px solid ${isApproved ? "#16a34a" : "#dc2626"};">
          <p style="margin: 0; color: ${isApproved ? "#16a34a" : "#dc2626"}; font-size: 16px; font-weight: 600;">
            ${isApproved ? "✓ Your identity has been successfully verified!" : "✕ Your verification was not successful."}
          </p>
        </td>
      </tr>
    </table>
    
    ${isApproved ? `
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Congratulations! You now have full access to all platform features including higher withdrawal limits and advanced trading options.
    </p>
    ` : `
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Unfortunately, we were unable to verify your identity based on the documents provided.
    </p>
    ${data.reason ? `
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      <strong>Reason:</strong> ${data.reason}
    </p>
    ` : ''}
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Please submit new documents ensuring they are clear, valid, and match your account information.
    </p>
    `}
    
    <!-- CTA Button -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${SITE_URL}/${isApproved ? "dashboard" : "kyc"}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            ${isApproved ? "Go to Dashboard" : "Submit New Documents"}
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to,
    subject: `${siteName} - KYC Verification ${isApproved ? "Approved" : "Declined"}`,
    html: emailTemplate(content, siteName),
  });
}

// ============================================
// DEPOSIT-SPECIFIC EMAILS
// ============================================
export async function sendDepositSubmittedEmail(
  to: string,
  data: {
    fullName: string;
    amount: number;
    currency: string;
    cryptoAmount: number;
    cryptoCurrency: string;
    reference: string;
  }
) {
  const siteName = await getSiteName();
  
  const content = `
    <h2 style="margin: 0 0 24px 0; color: #0f172a; font-size: 24px; font-weight: 600;">
      Deposit Request Submitted
    </h2>
    
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Dear ${data.fullName},
    </p>
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Your deposit request has been submitted successfully and is now pending review.
    </p>
    
    <!-- Status Badge -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <span style="display: inline-block; background-color: #fef3c7; color: #d97706; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
            ⏳ Pending Review
          </span>
        </td>
      </tr>
    </table>
    
    <!-- Transaction Details -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0; border-collapse: collapse;">
      <tr>
        <td style="background-color: #f8fafc; border-radius: 8px; padding: 24px;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Reference</span>
                <span style="color: #0f172a; font-size: 14px; font-family: monospace; float: right;">${data.reference}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Amount</span>
                <span style="color: #0f172a; font-size: 16px; font-weight: 600; float: right;">${data.amount.toLocaleString()} ${data.currency}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Crypto Amount</span>
                <span style="color: #0f172a; font-size: 16px; font-weight: 600; float: right;">${data.cryptoAmount} ${data.cryptoCurrency}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #64748b; font-size: 14px;">Status</span>
                <span style="color: #d97706; font-size: 16px; font-weight: 600; float: right;">Pending</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Our team will review your deposit and verify the payment. You will receive another email once your deposit has been processed.
    </p>
    
    <!-- CTA Button -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${SITE_URL}/dashboard/transactions" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            View Transaction Status
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to,
    subject: `${siteName} - Deposit Request Submitted (${data.reference})`,
    html: emailTemplate(content, siteName),
  });
}

export async function sendDepositApprovedEmail(
  to: string,
  data: {
    fullName: string;
    amount: number;
    currency: string;
    reference: string;
  }
) {
  const siteName = await getSiteName();
  
  const content = `
    <h2 style="margin: 0 0 24px 0; color: #0f172a; font-size: 24px; font-weight: 600;">
      Deposit Approved!
    </h2>
    
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Dear ${data.fullName},
    </p>
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Great news! Your deposit has been approved and the funds have been credited to your account.
    </p>
    
    <!-- Status Badge -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <span style="display: inline-block; background-color: #dcfce7; color: #16a34a; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
            ✓ Approved
          </span>
        </td>
      </tr>
    </table>
    
    <!-- Transaction Details -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0; border-collapse: collapse;">
      <tr>
        <td style="background-color: #f8fafc; border-radius: 8px; padding: 24px;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Reference</span>
                <span style="color: #0f172a; font-size: 14px; font-family: monospace; float: right;">${data.reference}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Amount Credited</span>
                <span style="color: #16a34a; font-size: 18px; font-weight: 700; float: right;">+${data.amount.toLocaleString()} ${data.currency}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #64748b; font-size: 14px;">Status</span>
                <span style="color: #16a34a; font-size: 16px; font-weight: 600; float: right;">Approved</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Your funds are now available for trading and investments. Start growing your portfolio today!
    </p>
    
    <!-- CTA Button -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Go to Dashboard
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to,
    subject: `${siteName} - Deposit Approved! (+${data.amount.toLocaleString()} ${data.currency})`,
    html: emailTemplate(content, siteName),
  });
}

export async function sendDepositDeclinedEmail(
  to: string,
  data: {
    fullName: string;
    amount: number;
    currency: string;
    reference: string;
    reason?: string;
  }
) {
  const siteName = await getSiteName();
  
  const content = `
    <h2 style="margin: 0 0 24px 0; color: #0f172a; font-size: 24px; font-weight: 600;">
      Deposit Declined
    </h2>
    
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Dear ${data.fullName},
    </p>
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Unfortunately, your deposit request could not be processed.
    </p>
    
    <!-- Status Badge -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <span style="display: inline-block; background-color: #fee2e2; color: #dc2626; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
            ✕ Declined
          </span>
        </td>
      </tr>
    </table>
    
    <!-- Transaction Details -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0; border-collapse: collapse;">
      <tr>
        <td style="background-color: #f8fafc; border-radius: 8px; padding: 24px;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Reference</span>
                <span style="color: #0f172a; font-size: 14px; font-family: monospace; float: right;">${data.reference}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 14px;">Amount</span>
                <span style="color: #0f172a; font-size: 16px; font-weight: 600; float: right;">${data.amount.toLocaleString()} ${data.currency}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #64748b; font-size: 14px;">Status</span>
                <span style="color: #dc2626; font-size: 16px; font-weight: 600; float: right;">Declined</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${data.reason ? `
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="background-color: #fee2e2; border-radius: 8px; padding: 16px; border-left: 4px solid #dc2626;">
          <p style="margin: 0; color: #dc2626; font-size: 14px;">
            <strong>Reason:</strong> ${data.reason}
          </p>
        </td>
      </tr>
    </table>
    ` : ''}
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      If you believe this was an error or need assistance, please contact our support team.
    </p>
    
    <!-- CTA Button -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${SITE_URL}/dashboard/deposit" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Try Again
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to,
    subject: `${siteName} - Deposit Declined (${data.reference})`,
    html: emailTemplate(content, siteName),
  });
}

// ============================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================
export async function sendDepositApprovedEmailLegacy(to: string, amount: number, asset: string) {
  return sendTransactionEmail(to, { type: "DEPOSIT", status: "APPROVED", amount, asset });
}

export async function sendDepositDeclinedEmailLegacy(to: string, amount: number, asset: string) {
  return sendTransactionEmail(to, { type: "DEPOSIT", status: "DECLINED", amount, asset });
}

export async function sendWithdrawalApprovedEmail(to: string, amount: number, asset: string) {
  return sendTransactionEmail(to, { type: "WITHDRAWAL", status: "APPROVED", amount, asset });
}

export async function sendWithdrawalDeclinedEmail(to: string, amount: number, asset: string) {
  return sendTransactionEmail(to, { type: "WITHDRAWAL", status: "DECLINED", amount, asset });
}

export async function sendKYCApprovedEmail(to: string) {
  return sendKYCStatusEmail(to, { fullName: "Valued Customer", status: "APPROVED" });
}

export async function sendKYCDeclinedEmail(to: string, reason?: string) {
  return sendKYCStatusEmail(to, { fullName: "Valued Customer", status: "REJECTED", reason });
}

export async function sendKYCSubmittedEmail(to: string, fullName: string) {
  const siteName = await getSiteName();
  
  const content = `
    <h2 style="margin: 0 0 24px 0; color: #0f172a; font-size: 24px; font-weight: 600;">
      KYC Verification Submitted
    </h2>
    
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Dear ${fullName},
    </p>
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Thank you for submitting your identity verification documents. Our team will review your application shortly.
    </p>
    
    <!-- Status Badge -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <span style="display: inline-block; background-color: #fef3c7; color: #d97706; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
            ⏳ Under Review
          </span>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      The verification process typically takes 1-2 business days. You will receive an email notification once your documents have been reviewed.
    </p>
    
    <!-- CTA Button -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Go to Dashboard
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to,
    subject: `${siteName} - KYC Verification Submitted`,
    html: emailTemplate(content, siteName),
  });
}

export async function sendAccountSuspendedEmail(to: string) {
  return sendAccountStatusEmail(to, { fullName: "Valued Customer", status: "SUSPENDED" });
}

export async function sendAccountReactivatedEmail(to: string) {
  return sendAccountStatusEmail(to, { fullName: "Valued Customer", status: "REACTIVATED" });
}

// ============================================
// ADMIN TRANSACTION EMAILS
// ============================================

export async function sendAdminDepositEmail(
  to: string,
  data: { fullName: string; amount: number; currency: string }
) {
  const siteName = await getSiteName();
  
  const content = `
    <h2 style="margin: 0 0 24px 0; color: #0f172a; font-size: 24px; font-weight: 600;">
      Deposit Credited!
    </h2>
    
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Dear ${data.fullName},
    </p>
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      A deposit has been credited to your account.
    </p>
    
    <!-- Amount Box -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="background-color: #dcfce7; border-radius: 12px; padding: 24px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #16a34a; font-size: 14px; font-weight: 500;">Amount Credited</p>
          <p style="margin: 0; color: #16a34a; font-size: 32px; font-weight: 700;">+${data.amount.toLocaleString()} ${data.currency}</p>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Your funds are now available in your account.
    </p>
    
    <!-- CTA Button -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            View Dashboard
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to,
    subject: `${siteName} - Deposit Credited (+${data.amount.toLocaleString()} ${data.currency})`,
    html: emailTemplate(content, siteName),
  });
}

export async function sendAdminWithdrawalEmail(
  to: string,
  data: { fullName: string; amount: number; currency: string }
) {
  const siteName = await getSiteName();
  
  const content = `
    <h2 style="margin: 0 0 24px 0; color: #0f172a; font-size: 24px; font-weight: 600;">
      Withdrawal Processed
    </h2>
    
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Dear ${data.fullName},
    </p>
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      A withdrawal has been processed from your account.
    </p>
    
    <!-- Amount Box -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="background-color: #fef3c7; border-radius: 12px; padding: 24px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #d97706; font-size: 14px; font-weight: 500;">Amount Withdrawn</p>
          <p style="margin: 0; color: #d97706; font-size: 32px; font-weight: 700;">-${data.amount.toLocaleString()} ${data.currency}</p>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${SITE_URL}/dashboard/transactions" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            View Transactions
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to,
    subject: `${siteName} - Withdrawal Processed (-${data.amount.toLocaleString()} ${data.currency})`,
    html: emailTemplate(content, siteName),
  });
}

export async function sendProfitCreditedEmail(
  to: string,
  data: { fullName: string; amount: number; currency: string; description?: string }
) {
  const siteName = await getSiteName();
  
  const content = `
    <h2 style="margin: 0 0 24px 0; color: #0f172a; font-size: 24px; font-weight: 600;">
      Profit Credited! 🎉
    </h2>
    
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Dear ${data.fullName},
    </p>
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Great news! A profit has been credited to your account.
    </p>
    
    <!-- Amount Box -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 12px; padding: 24px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500;">Profit Earned</p>
          <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700;">+${data.amount.toLocaleString()} ${data.currency}</p>
        </td>
      </tr>
    </table>
    
    ${data.description ? `
    <p style="margin: 0 0 24px 0; color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">
      ${data.description}
    </p>
    ` : ''}
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Your profit has been added to your balance and is available for withdrawal or reinvestment.
    </p>
    
    <!-- CTA Button -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            View Dashboard
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to,
    subject: `${siteName} - Profit Credited! (+${data.amount.toLocaleString()} ${data.currency})`,
    html: emailTemplate(content, siteName),
  });
}

export async function sendBonusCreditedEmail(
  to: string,
  data: { fullName: string; amount: number; currency: string; description?: string }
) {
  const siteName = await getSiteName();
  
  const content = `
    <h2 style="margin: 0 0 24px 0; color: #0f172a; font-size: 24px; font-weight: 600;">
      Bonus Received! 🎁
    </h2>
    
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Dear ${data.fullName},
    </p>
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Congratulations! You've received a bonus in your account.
    </p>
    
    <!-- Amount Box -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 12px; padding: 24px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500;">Bonus Amount</p>
          <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700;">+${data.amount.toLocaleString()} ${data.currency}</p>
        </td>
      </tr>
    </table>
    
    ${data.description ? `
    <p style="margin: 0 0 24px 0; color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">
      ${data.description}
    </p>
    ` : ''}
    
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Thank you for being a valued member of our platform!
    </p>
    
    <!-- CTA Button -->
    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            View Dashboard
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to,
    subject: `${siteName} - Bonus Received! (+${data.amount.toLocaleString()} ${data.currency})`,
    html: emailTemplate(content, siteName),
  });
}

const DEFAULT_FROM = "RIAF <onboarding@resend.dev>";

export type LoginCodeDelivery = {
  delivered: boolean;
  devCode?: string;
  transport: "resend" | "smtp" | "development";
};

type CodeTemplate = {
  subject: string;
  text: string;
  html: string;
};

function fromAddress() {
  return process.env.AUTH_EMAIL_FROM?.trim() || DEFAULT_FROM;
}

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS,
  );
}

export function isEmailDeliveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() || smtpConfigured());
}

function buildSignInMessage(code: string): CodeTemplate {
  const text = [
    "Your RIAF sign-in code",
    "",
    `Enter this code to finish signing in: ${code}`,
    "",
    "The code expires in 10 minutes. If you did not try to sign in, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #201f1c;">
      <p style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #7a7a5c;">RIAF account</p>
      <h1 style="font-size: 22px; margin: 12px 0 8px;">Your sign-in code</h1>
      <p style="font-size: 14px; color: #55524c;">Enter this code to finish signing in:</p>
      <p style="font-size: 34px; font-weight: 700; letter-spacing: 0.32em; margin: 20px 0;">${code}</p>
      <p style="font-size: 13px; color: #55524c;">The code expires in 10 minutes. If you did not try to sign in, you can ignore this email.</p>
    </div>
  `;

  return { subject: "Your RIAF sign-in code", text, html };
}

function buildAdminSignInMessage(code: string): CodeTemplate {
  const text = [
    "Your RIAF admin sign-in code",
    "",
    `Enter this code to open the admin panel: ${code}`,
    "",
    "The code expires in 10 minutes. If you did not try to sign in, someone may have your admin password — change it immediately.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #201f1c;">
      <p style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #7a7a5c;">RIAF admin</p>
      <h1 style="font-size: 22px; margin: 12px 0 8px;">Your admin sign-in code</h1>
      <p style="font-size: 14px; color: #55524c;">Enter this code to open the admin panel:</p>
      <p style="font-size: 34px; font-weight: 700; letter-spacing: 0.32em; margin: 20px 0;">${code}</p>
      <p style="font-size: 13px; color: #55524c;">The code expires in 10 minutes. If you did not try to sign in, someone may have your admin password — change it immediately.</p>
    </div>
  `;

  return { subject: "Your RIAF admin sign-in code", text, html };
}

function buildPasswordResetMessage(code: string): CodeTemplate {
  const text = [
    "Reset your RIAF password",
    "",
    `Enter this code to choose a new password: ${code}`,
    "",
    "The code expires in 10 minutes. If you did not ask to reset your password, you can ignore this email and your password will stay the same.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #201f1c;">
      <p style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #7a7a5c;">RIAF account</p>
      <h1 style="font-size: 22px; margin: 12px 0 8px;">Reset your password</h1>
      <p style="font-size: 14px; color: #55524c;">Enter this code to choose a new password:</p>
      <p style="font-size: 34px; font-weight: 700; letter-spacing: 0.32em; margin: 20px 0;">${code}</p>
      <p style="font-size: 13px; color: #55524c;">The code expires in 10 minutes. If you did not ask to reset your password, you can ignore this email and your password will stay the same.</p>
    </div>
  `;

  return { subject: "Reset your RIAF password", text, html };
}

async function sendWithResend(email: string, message: CodeTemplate) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [email],
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Resend rejected the message (${response.status})${
        detail ? `: ${detail.slice(0, 200)}` : ""
      }`,
    );
  }
}

async function sendWithSmtp(email: string, message: CodeTemplate) {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured.");
  }

  const nodemailer = await import("nodemailer");
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true";

  const transport = nodemailer.createTransport({
    host,
    port: Number.isFinite(port) ? port : 587,
    secure,
    auth: { user, pass },
  });

  await transport.sendMail({
    from: fromAddress(),
    to: email,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}

async function deliverCode(
  email: string,
  code: string,
  message: CodeTemplate,
  devLabel: string,
): Promise<LoginCodeDelivery> {
  const resendKey = process.env.RESEND_API_KEY?.trim();

  if (resendKey) {
    try {
      await sendWithResend(email, message);
      return { delivered: true, transport: "resend" };
    } catch (error) {
      console.error("Could not send email with Resend", error);
    }
  }

  if (smtpConfigured()) {
    try {
      await sendWithSmtp(email, message);
      return { delivered: true, transport: "smtp" };
    } catch (error) {
      console.error("Could not send email over SMTP", error);
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(`[RIAF dev] ${devLabel} for ${email}: ${code}`);
    return {
      delivered: false,
      devCode: code,
      transport: "development",
    };
  }

  throw new Error(
    "Email delivery is not configured. Set RESEND_API_KEY or SMTP settings on the server.",
  );
}

export async function sendLoginCode(
  email: string,
  code: string,
): Promise<LoginCodeDelivery> {
  return deliverCode(email, code, buildSignInMessage(code), "Sign-in code");
}

export async function sendPasswordResetCode(
  email: string,
  code: string,
): Promise<LoginCodeDelivery> {
  return deliverCode(
    email,
    code,
    buildPasswordResetMessage(code),
    "Password reset code",
  );
}

export async function sendAdminLoginCode(
  email: string,
  code: string,
): Promise<LoginCodeDelivery> {
  return deliverCode(email, code, buildAdminSignInMessage(code), "Admin code");
}

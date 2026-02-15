import { createWelcomeEmailTemplate } from "./emailTemplate.js";
import { createVerificationEmailTemplate } from "./verificationTemplate.js";
import { resendClient, sender } from "../lib/resend.js";
import transporter, { createSmtpTransporter, smtpConfig } from "../lib/nodemailer.js";
import { ENV } from "../lib/env.js";

const isSmtpNetworkError = (error) => {
  const code = error?.code;
  return ["ETIMEDOUT", "ESOCKET", "ECONNECTION", "ECONNRESET", "ENETUNREACH", "EHOSTUNREACH"].includes(code);
};

const isGmailHost = (host = "") => /(^|\.)smtp\.gmail\.com$/i.test(host);

const tryGmailAltPort = async (mailOptions) => {
  const altTransporter = createSmtpTransporter({ host: "smtp.gmail.com", port: 465, secure: true });
  const info = await altTransporter.sendMail(mailOptions);
  console.log("✅ Verification email sent via SMTP fallback (gmail:465):", info.messageId);
  return {
    provider: "smtp",
    id: info?.messageId || null,
  };
};

const sendVerificationViaResend = async (email, name, verificationLink) => {
  if (!resendClient) {
    throw new Error("Resend is not configured. Set RESEND_API_KEY for email fallback.");
  }

  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: "Verify Your Email Address - Nids",
    html: createVerificationEmailTemplate(name, verificationLink),
  });

  if (error) {
    console.error("❌ Resend verification error:", error);
    throw new Error(error?.message || "Resend failed to send verification email");
  }

  console.log("✅ Verification email sent via Resend:", data?.id || data);
  return {
    provider: "resend",
    id: data?.id || null,
  };
};

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    // Skip if Resend is not configured
    if (!resendClient) {
      console.log("⚠️ Resend not configured, skipping welcome email");
      return;
    }

    const { data, error } = await resendClient.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to:email , 
      subject: "Welcome to Nids",
      html: createWelcomeEmailTemplate(name, clientURL),
    });

    if (error) {
      console.error("❌ Error sending welcome email:", error);
      throw new Error("Failed to send welcome email");
    }

    console.log("✅ Email sent successfully:", data);
  } catch (err) {
    console.error("❌ Unexpected error in sendWelcomeEmail:", err);
  }
};

export const sendVerificationEmail = async (email, name, verificationLink) => {
  const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

  if (smtpConfigured) {
    try {
      const mailOptions = {
        from: `"${ENV.EMAIL_FROM_NAME || "Nids Team"}" <${ENV.EMAIL_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify Your Email Address - Nids",
        html: createVerificationEmailTemplate(name, verificationLink),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Verification email sent via SMTP:", info.messageId);
      return {
        provider: "smtp",
        id: info?.messageId || null,
      };
    } catch (error) {
      console.error("❌ SMTP verification send failed:", {
        message: error?.message,
        code: error?.code,
        responseCode: error?.responseCode,
        command: error?.command,
      });

      if (isSmtpNetworkError(error) && isGmailHost(smtpConfig.host) && Number(smtpConfig.port) === 587) {
        try {
          console.log("↩️ Trying SMTP fallback for verification email (gmail:465)...");
          return await tryGmailAltPort(mailOptions);
        } catch (gmailFallbackError) {
          console.error("❌ SMTP gmail:465 fallback failed:", {
            message: gmailFallbackError?.message,
            code: gmailFallbackError?.code,
            responseCode: gmailFallbackError?.responseCode,
            command: gmailFallbackError?.command,
          });
        }
      }

      if (isSmtpNetworkError(error) && resendClient) {
        console.log("↩️ Trying Resend fallback for verification email...");
        return sendVerificationViaResend(email, name, verificationLink);
      }

      throw new Error(error?.message || "Failed to send verification email via SMTP");
    }
  }

  if (resendClient) {
    return sendVerificationViaResend(email, name, verificationLink);
  }

  throw new Error("No email provider configured. Set SMTP_USER/SMTP_PASS or RESEND_API_KEY.");
};

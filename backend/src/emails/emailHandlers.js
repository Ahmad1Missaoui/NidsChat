import { createWelcomeEmailTemplate } from "./emailTemplate.js";
import { createVerificationEmailTemplate } from "./verificationTemplate.js";
import { resendClient, sender } from "../lib/resend.js";

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
  if (!resendClient) {
    throw new Error("Resend is not configured. Set RESEND_API_KEY to send verification emails.");
  }

  return sendVerificationViaResend(email, name, verificationLink);
};

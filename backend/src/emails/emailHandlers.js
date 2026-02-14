import { createWelcomeEmailTemplate } from "./emailTemplate.js  ";
import { createVerificationEmailTemplate } from "./verificationTemplate.js";
import { resendClient, sender } from "../lib/resend.js";
import transporter from "../lib/nodemailer.js";

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
  try {
    const mailOptions = {
      from: `"Nids Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify Your Email Address - Nids",
      html: createVerificationEmailTemplate(name, verificationLink),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

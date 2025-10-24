import { createWelcomeEmailTemplate } from "./emailTemplate.js  ";
import { resendClient, sender } from "../lib/resend.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
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

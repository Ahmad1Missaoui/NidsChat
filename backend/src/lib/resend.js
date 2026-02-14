import {Resend} from "resend";
import {ENV} from "./env.js";

// Make Resend optional - only initialize if API key exists
export const resendClient = ENV.RESEND_API_KEY ? new Resend(ENV.RESEND_API_KEY) : null;

export const sender = {
  email: ENV.EMAIL_FROM || "noreply@example.com",
  name: ENV.EMAIL_FROM_NAME || "NIDS Chat",
};

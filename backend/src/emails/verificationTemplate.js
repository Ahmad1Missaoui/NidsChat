export function createVerificationEmailTemplate(name, verificationLink) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - NIDS</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #e5e7eb; max-width: 600px; margin: 0 auto; padding: 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
    <!-- Main Container -->
    <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%); backdrop-filter: blur(10px); margin: 20px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(250, 204, 21, 0.1); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);">
      
      <!-- Header with Gold Gradient -->
      <div style="background: linear-gradient(135deg, #facc15 0%, #d4af37 100%); padding: 40px 30px; text-align: center; position: relative;">
        <div style="background: rgba(255, 255, 255, 0.1); width: 100px; height: 100px; margin: 0 auto 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); border: 3px solid rgba(255, 255, 255, 0.2);">
          <div style="width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; color: #facc15; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);">
            ✉️
          </div>
        </div>
        <h1 style="color: #0f172a; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Verify Your Email</h1>
        <p style="color: rgba(15, 23, 42, 0.8); margin: 10px 0 0 0; font-size: 16px;">Welcome to NIDS Chat</p>
      </div>
      
      <!-- Content -->
      <div style="background: rgba(255, 255, 255, 0.02); padding: 40px 30px; backdrop-filter: blur(20px);">
        <p style="font-size: 20px; color: #facc15; margin: 0 0 20px 0;"><strong>Hello ${name},</strong></p>
        <p style="color: #d1d5db; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">Thank you for signing up for <strong style="color: #facc15;">NIDS</strong>! We're excited to have you join our community. Please verify your email address to activate your account and start chatting with friends.</p>
        
        <!-- Info Box -->
        <div style="background: linear-gradient(135deg, rgba(137, 207, 240, 0.1) 0%, rgba(250, 204, 21, 0.1) 100%); padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #89CFF0; backdrop-filter: blur(10px);">
          <p style="font-size: 16px; margin: 0 0 10px 0; color: #89CFF0;"><strong>✨ Why verify?</strong></p>
          <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">Email verification ensures the security of your account and unlocks features like password recovery, notifications, and more.</p>
        </div>
        
        <!-- Verification Button -->
        <div style="text-align: center; margin: 35px 0;">
          <a href="${verificationLink}" style="background: linear-gradient(135deg, #89CFF0 0%, #facc15 100%); color: #0f172a; text-decoration: none; padding: 16px 45px; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 10px 30px rgba(250, 204, 21, 0.3); transition: all 0.3s ease; border: 2px solid rgba(255, 255, 255, 0.2);">Verify Email Address →</a>
        </div>
        
        <!-- Warning Box -->
        <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%); border-left: 4px solid #fbbf24; padding: 18px; border-radius: 10px; margin: 25px 0;">
          <p style="margin: 0; font-size: 14px; color: #fcd34d;">⏱️ <strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
        </div>
        
        <!-- Security Notice -->
        <div style="background: rgba(255, 255, 255, 0.02); padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid rgba(255, 255, 255, 0.05);">
          <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">🔒 <strong>Security Tip:</strong></p>
          <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">If you didn't create a NIDS account, please ignore this email. Your email address will not be used without verification.</p>
        </div>
        
        <!-- Signature -->
        <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="margin: 0 0 5px 0; color: #d1d5db; font-size: 15px;">Best regards,</p>
          <p style="margin: 0; color: #facc15; font-size: 16px; font-weight: 600;">The NIDS Team 💬</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: rgba(0, 0, 0, 0.2); text-align: center; padding: 30px 20px; border-top: 1px solid rgba(250, 204, 21, 0.1);">
        <div style="margin-bottom: 15px;">
          <span style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #facc15 0%, #d4af37 100%); border-radius: 50%; line-height: 40px; color: #0f172a; font-weight: bold; font-size: 18px; margin: 0 auto;">N</span>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 15px 0;">© 2026 NIDS Chat. All rights reserved.</p>
        <p style="margin: 0;">
          <a href="#" style="color: #89CFF0; text-decoration: none; margin: 0 12px; font-size: 12px; transition: color 0.3s;">Privacy Policy</a>
          <span style="color: #374151;">•</span>
          <a href="#" style="color: #89CFF0; text-decoration: none; margin: 0 12px; font-size: 12px; transition: color 0.3s;">Terms of Service</a>
          <span style="color: #374151;">•</span>
          <a href="#" style="color: #89CFF0; text-decoration: none; margin: 0 12px; font-size: 12px; transition: color 0.3s;">Support</a>
        </p>
      </div>
    </div>
    
    <!-- Outer Padding -->
    <div style="text-align: center; padding: 20px; color: #4b5563; font-size: 11px;">
      <p style="margin: 0;">This is an automated message, please do not reply to this email.</p>
    </div>
  </body>
  </html>
  `;
}

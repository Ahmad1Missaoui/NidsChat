import nodemailer from 'nodemailer';
import { ENV } from './env.js';

// Create nodemailer transporter
export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ SMTP connection error:', error);
    } else {
        console.log('✅ SMTP server is ready to send emails');
    }
});

export default transporter;

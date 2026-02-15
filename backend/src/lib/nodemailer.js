import nodemailer from 'nodemailer';
import { ENV } from './env.js';

// Create nodemailer transporter
const smtpPort = Number.parseInt(process.env.SMTP_PORT, 10) || 587;
const smtpSecure = process.env.SMTP_SECURE
    ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
    : smtpPort === 465;

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: smtpPort,
    secure: smtpSecure,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ SMTP connection error:', {
            message: error?.message,
            code: error?.code,
            responseCode: error?.responseCode,
            command: error?.command,
        });
    } else {
        console.log(`✅ SMTP server is ready to send emails (${process.env.SMTP_HOST || 'smtp.gmail.com'}:${smtpPort}, secure=${smtpSecure})`);
    }
});

export default transporter;

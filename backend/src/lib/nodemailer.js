import nodemailer from 'nodemailer';
import dns from 'node:dns';
import { ENV } from './env.js';

// Create nodemailer transporter
const smtpPort = Number.parseInt(process.env.SMTP_PORT, 10) || 587;
const smtpSecure = process.env.SMTP_SECURE
    ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
    : smtpPort === 465;
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';

const lookupIPv4 = (hostname, options, callback) => {
    dns.lookup(hostname, { ...options, family: 4, all: false }, callback);
};

export const createSmtpTransporter = (overrides = {}) => {
    const host = overrides.host || smtpHost;
    const port = overrides.port || smtpPort;
    const secure = typeof overrides.secure === 'boolean' ? overrides.secure : smtpSecure;

    return nodemailer.createTransport({
        host,
        port,
        secure,
        requireTLS: !secure,
        connectionTimeout: Number.parseInt(process.env.SMTP_CONNECTION_TIMEOUT || '20000', 10),
        greetingTimeout: Number.parseInt(process.env.SMTP_GREETING_TIMEOUT || '15000', 10),
        socketTimeout: Number.parseInt(process.env.SMTP_SOCKET_TIMEOUT || '20000', 10),
        lookup: lookupIPv4,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            servername: host,
        },
    });
};

export const smtpConfig = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
};

export const transporter = createSmtpTransporter();

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ SMTP connection error:', {
            message: error?.message,
            code: error?.code,
            responseCode: error?.responseCode,
            command: error?.command,
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
        });
    } else {
        console.log(`✅ SMTP server is ready to send emails (${smtpHost}:${smtpPort}, secure=${smtpSecure})`);
    }
});

export default transporter;

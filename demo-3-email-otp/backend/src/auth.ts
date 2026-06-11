import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import nodemailer from 'nodemailer';
import db from './db.js';

let cachedTransporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
    if (cachedTransporter) return cachedTransporter;

    if (process.env.SMTP_HOST) {
        cachedTransporter = nodemailer.createTransport({
            host   : process.env.SMTP_HOST,
            port   : parseInt(process.env.SMTP_PORT ?? '587'),
            secure : process.env.SMTP_SECURE === 'true',
            auth   : {
                user : process.env.SMTP_USER,
                pass : process.env.SMTP_PASS
            }
        });
        console.log('Using SMTP:', process.env.SMTP_HOST);
    }
    else {
        const testAccount = await nodemailer.createTestAccount();
        cachedTransporter = nodemailer.createTransport({
            host   : 'smtp.ethereal.email',
            port   : 587,
            secure : false,
            auth   : { user : testAccount.user, pass : testAccount.pass }
        });
        console.log('Using Ethereal test account:', testAccount.user);
        console.log('View sent emails at: https://ethereal.email/login');
        console.log('  User:', testAccount.user, 'Pass:', testAccount.pass);
    }

    return cachedTransporter;
}

export const auth = betterAuth({
    database       : db,
    trustedOrigins : ['http://localhost:5173'],
    plugins        : [
        emailOTP({
            disableSignUp : false,
            async sendVerificationOTP({ email, otp, type }) {
                if (type !== 'sign-in') return;

                // Secondary guard — primary check happens in /api/check-approved
                const approved = db.prepare('SELECT 1 FROM approved_emails WHERE email = ?').get(email);
                if (!approved) return;

                const t = await getTransporter();
                const info = await t.sendMail({
                    from    : '"Project Gantt" <noreply@projectgantt.dev>',
                    to      : email,
                    subject : 'Your Gantt access code',
                    text    : `Your access code: ${otp}\n\nThis code expires in 5 minutes.`
                });

                console.log(`\n--- OTP for ${email} ---`);
                console.log(`Code: ${otp}`);
                const previewUrl = nodemailer.getTestMessageUrl(info);
                if (previewUrl) {
                    console.log(`Email preview: ${previewUrl}`);
                }
                console.log(`------------------------\n`);
            }
        })
    ]
});

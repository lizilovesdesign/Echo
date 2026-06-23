import nodemailer from 'nodemailer';
import { env } from '@/lib/env';
import { welcomeEmailHtml, passwordResetHtml } from './templates';
import { logger } from '@/lib/logger';

function createTransport(): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const transport = createTransport();
  const appUrl = env.NEXT_PUBLIC_APP_URL;
  try {
    await transport.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: 'Welcome to Echo — your private music journal is ready',
      html: welcomeEmailHtml(name, appUrl),
    });
    logger.info('email.welcome.sent', { to });
  } catch (error) {
    logger.error('email.welcome.failed', { to, error });
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const transport = createTransport();
  try {
    await transport.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: 'Reset your Echo password',
      html: passwordResetHtml(resetLink),
    });
    logger.info('email.password_reset.sent', { to });
  } catch (error) {
    logger.error('email.password_reset.failed', { to, error });
    throw new Error('Failed to send password reset email.');
  }
}



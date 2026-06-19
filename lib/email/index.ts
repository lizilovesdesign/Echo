import nodemailer from 'nodemailer';
import { env } from '@/lib/env';
import { welcomeEmailHtml, signinEmailHtml } from './templates';
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
  await transport.sendMail({
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
    to,
    subject: 'Welcome to Echo — your private music journal is ready',
    html: welcomeEmailHtml(name, appUrl),
  });
  logger.info('email.welcome.sent', { to });
}

export async function sendSigninEmail(to: string): Promise<void> {
  const transport = createTransport();
  const appUrl = env.NEXT_PUBLIC_APP_URL;
  await transport.sendMail({
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
    to,
    subject: 'Sign in to Echo',
    html: signinEmailHtml(appUrl),
  });
  logger.info('email.signin.sent', { to });
}

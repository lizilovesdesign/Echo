# Transactional Email — Workflow

## Architecture
Echo uses **Nodemailer with Gmail SMTP** to send transactional emails. The integration consists of:

- `lib/email/index.ts` — Nodemailer transport singleton + send functions
- `lib/email/templates.ts` — HTML email templates (dark-theme, inline styles from design tokens)
- `lib/email/design-tokens.ts` — Resolved design token values for email inline styles

## Adding a New Email Template

1. **Add the HTML template** in `lib/email/templates.ts`:
   ```ts
   export function someEmailHtml(vars: { ... }): string {
     return wrap(`<h1>...</h1><p>...</p>`);
   }
   ```
   Use the existing `wrap()` helper for the full HTML shell (consistent with Echo brand dark theme).

2. **Add the send function** in `lib/email/index.ts`:
   ```ts
   export async function sendSomeEmail(to: string, vars: { ... }): Promise<void> {
     const transport = getTransport();
     await transport.sendMail({
       from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
       to,
       subject: '...',
       html: someEmailHtml(vars),
     });
   }
   ```

3. **Trigger it** from the appropriate API route or server action.

## Environment Variables
Required (all validated at boot by `lib/env.ts`):

| Variable | Local Development | Purpose |
|---|---|---|
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP port (587=TLS, 465=SSL) |
| `SMTP_USER` | `your-email@gmail.com` | Gmail address |
| `SMTP_PASS` | *(16-char app password)* | Gmail App Password (requires 2FA) |
| `SMTP_FROM_EMAIL` | `your-email@gmail.com` | From address for sent emails |
| `SMTP_FROM_NAME` | `Echo` | Display name for sender |

## Gmail SMTP Setup
1. Enable **2-Step Verification** on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an App Password for "Mail"
4. Copy the 16-character password into `SMTP_PASS`

## Password Reset
Echo relies on **Supabase Auth's built-in password reset flow**. To brand those emails:
1. Go to **Supabase Dashboard → Authentication → Settings → SMTP Settings**
2. Configure a custom SMTP provider (the Gmail SMTP credentials above can be used)
3. Set the "From" name and address under **Email Templates → Confirmation & Reset**

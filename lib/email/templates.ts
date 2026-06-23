import { tokens } from './design-tokens';

const t = tokens;

const baseStyles = `
  body { margin: 0; padding: 0; background-color: ${t.color.bg}; font-family: ${t.font.family}; -webkit-font-smoothing: antialiased; }
  .outer { width: 100%; background-color: ${t.color.bg}; padding: ${t.spacing.outerPadding}; box-sizing: border-box; }
  .inner { max-width: 480px; margin: 0 auto; background-color: ${t.color.card}; border-radius: ${t.spacing.borderRadius}; overflow: hidden; }
  .content { padding: ${t.spacing.cardPadding}; }
  .logo-wrap { text-align: center; margin-bottom: 28px; }
  .logo-svg { display: inline-block; margin-bottom: 10px; }
  .logo-text { font-size: ${t.font.title.size}; font-weight: ${t.font.title.weight}; line-height: ${t.font.title.lineHeight}; color: ${t.color.text}; letter-spacing: ${t.font.title.letterSpacing}; display: block; }
  .heading { font-size: ${t.font.heading.size}; font-weight: ${t.font.heading.weight}; color: ${t.color.text}; line-height: ${t.font.heading.lineHeight}; margin: 0 0 8px; text-align: center; }
  .text { font-size: ${t.font.body.size}; line-height: ${t.font.body.lineHeight}; color: ${t.color.muted}; margin: 0 0 20px; text-align: center; }
  .btn-wrap { text-align: center; margin: 28px 0; }
  .btn { display: inline-block; padding: ${t.spacing.buttonPadding}; background-color: ${t.color.btnBg}; color: ${t.color.btnText} !important; text-decoration: none; border-radius: ${t.spacing.buttonRadius}; font-size: ${t.font.label.size}; font-weight: ${t.font.label.weight}; line-height: ${t.font.label.lineHeight}; }
  .divider { height: 1px; background-color: ${t.color.border}; margin: 28px 0; }
  .footer { padding: 20px 32px; background-color: ${t.color.footerBg}; text-align: center; }
  .footer-text { font-size: ${t.font.small.size}; line-height: ${t.font.small.lineHeight}; color: ${t.color.subtle}; margin: 0; }
  .footer-text a { color: ${t.color.muted}; text-decoration: underline; }
`;

function wrap(content: string, footerExtras?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Echo</title>
  <style>${baseStyles}</style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="outer">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" role="presentation" class="inner">
          <tr><td class="content">
            <div class="logo-wrap">
              <svg class="logo-svg" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9.5" cy="17.5" r="3.5" stroke="#ff7d6b" stroke-width="1.5"/>
                <path d="M13 17.5V5C13 4.09 13 3.635 13.2466 3.3525C13.4932 3.0699 13.9938 3.0016 14.9949 2.865C18.0085 2.4539 20.2013 1.198 21.3696 0.4294C21.6498 0.2451 21.7898 0.153 21.8949 0.2096C22 0.2663 22 0.4318 22 0.7628V11.9259" stroke="#ff7d6b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 8.5C17.8 8.5 21 6.1667 22 5.5" stroke="#ff7d6b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="19.5" cy="16" r="2.5" stroke="#ff7d6b" stroke-width="1.5"/>
              </svg>
              <span class="logo-text">echo</span>
            </div>
            ${content}
          </td></tr>
          <tr><td class="footer">
            <p class="footer-text">Echo — your private music journal</p>
            ${footerExtras ? `<p class="footer-text" style="margin-top:4px;">${footerExtras}</p>` : ''}
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function welcomeEmailHtml(name: string, appUrl: string): string {
  return wrap(`
    <h1 class="heading">Welcome to Echo, ${name}</h1>
    <p class="text">
      Your private music journal is ready. Every song in your library can now become a memory — anchored to a moment, tagged with a mood, entirely yours.
    </p>
    <div class="btn-wrap">
      <a href="${appUrl}/create" class="btn">Create Your First Echo</a>
    </div>
    <div class="divider"></div>
    <p class="text" style="font-size:13px;color:${t.color.subtle};">
      Your journal is completely private. No social feeds, no sharing — just your memories, your music, your space.
    </p>
  `);
}

export function passwordResetHtml(resetLink: string): string {
  return wrap(
    `
    <h1 class="heading">Reset your password</h1>
    <p class="text">
      We received a request to reset the password for your Echo account. Click the button below to set a new password.
    </p>
    <div class="btn-wrap">
      <a href="${resetLink}" class="btn">Reset Password</a>
    </div>
    <div class="divider"></div>
    <p class="text" style="font-size:13px;color:${t.color.subtle};">
      If you didn't request this, you can safely ignore this email. Your account remains secure.
    </p>
    <p class="text" style="font-size:13px;color:${t.color.subtle};margin-top:4px;">
      This link expires in 1 hour.
    </p>
    `,
    `If the button doesn't work, copy this link into your browser: <a href="${resetLink}" style="word-break:break-all;">${resetLink}</a>`
  );
}



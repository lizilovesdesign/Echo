import { tokens } from './design-tokens';

const t = tokens;

const baseStyles = `
  body { margin: 0; padding: 0; background-color: ${t.color.bg}; font-family: ${t.font.family}; -webkit-font-smoothing: antialiased; }
  .outer { width: 100%; background-color: ${t.color.bg}; padding: ${t.spacing.outerPadding}; box-sizing: border-box; }
  .inner { max-width: 480px; margin: 0 auto; background-color: ${t.color.card}; border-radius: ${t.spacing.borderRadius}; overflow: hidden; }
  .content { padding: ${t.spacing.cardPadding}; }
  .logo { text-align: center; margin-bottom: 28px; }
  .logo-circle { width: 48px; height: 48px; border-radius: 50%; background-color: ${t.color.bg}; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: ${t.color.muted}; }
  .logo-text { font-size: 20px; font-weight: 700; color: ${t.color.text}; letter-spacing: -0.3px; }
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
            <div class="logo">
              <div class="logo-circle">♪</div>
              <div class="logo-text">echo</div>
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

export function signinEmailHtml(appUrl: string): string {
  return wrap(`
    <h1 class="heading">Sign in to Echo</h1>
    <p class="text">
      A sign-in was requested for your Echo account. If this was you, click the button below to continue.
    </p>
    <div class="btn-wrap">
      <a href="${appUrl}/login" class="btn">Sign In</a>
    </div>
    <p class="text" style="font-size:13px;color:${t.color.subtle};margin-top:16px;">
      If you didn't request this, you can safely ignore this email.
    </p>
  `, 'If you didn\'t request this, you can safely ignore this email.');
}

export function confirmSignupEmailHtml(confirmationUrl: string): string {
  return `
    <h1 class="heading">Confirm your email</h1>
    <p class="text">
      Thanks for joining Echo. Click the button below to verify your email address and start capturing your musical memories.
    </p>
    <div class="btn-wrap">
      <a href="${confirmationUrl}" class="btn">Verify Email</a>
    </div>
    <p class="text" style="font-size:13px;color:${t.color.subtle};margin-top:16px;">
      If you didn't sign up for Echo, you can safely ignore this email.
    </p>
  `;
}

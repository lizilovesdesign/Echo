import { tokens } from './design-tokens';

const baseStyles = `
  .echo-body { font-family: ${tokens.font.family}; margin: 0; padding: 0; background-color: ${tokens.color.surface}; color: ${tokens.color.onSurface}; }
  .echo-container { max-width: 480px; margin: 0 auto; padding: ${tokens.spacing.containerPadding}; }
  .echo-card { background-color: ${tokens.color.surfaceContainerLow}; border-radius: ${tokens.spacing.borderRadius}; padding: ${tokens.spacing.cardPadding}; }
  .echo-logo { font-size: 24px; font-weight: 700; color: ${tokens.color.primary}; text-align: center; margin-bottom: 24px; }
  .echo-heading { font-size: ${tokens.font.heading.size}; font-weight: ${tokens.font.heading.weight}; color: ${tokens.color.onSurface}; margin: 0 0 8px; text-align: center; }
  .echo-text { font-size: ${tokens.font.body.size}; line-height: ${tokens.font.body.lineHeight}; color: ${tokens.color.onSurfaceVariant}; margin: 0 0 16px; text-align: center; }
  .echo-btn { display: inline-block; padding: ${tokens.spacing.buttonPadding}; background-color: ${tokens.color.primary}; color: ${tokens.color.onPrimary}; text-decoration: none; border-radius: ${tokens.spacing.buttonRadius}; font-weight: ${tokens.font.label.weight}; font-size: ${tokens.font.label.size}; }
  .echo-footer { font-size: ${tokens.font.small.size}; color: ${tokens.color.outline}; text-align: center; margin-top: 24px; }
  .echo-divider { height: 1px; background-color: ${tokens.color.outlineVariant}; margin: 24px 0; }
`;

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${baseStyles}</style>
</head>
<body class="echo-body">
  <div class="echo-container">
    <div class="echo-card">
      <div class="echo-logo">Echo</div>
      ${content}
    </div>
    <div class="echo-footer">
      <p>Echo — A Private Music & Emotional Journal</p>
      <p style="margin-top: 4px;">If you didn't create this account, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>`;
}

export function welcomeEmailHtml(name: string, appUrl: string): string {
  return wrap(`
    <h1 class="echo-heading">Welcome to Echo, ${name}</h1>
    <p class="echo-text">
      Your private music journal is ready. Every song in your library can now become
      a permanent emotional archive — a reflection of who you were in that moment.
    </p>
    <p class="echo-text">
      Anchor your first memory to a song and capture how it feels in under 20 seconds.
    </p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${appUrl}/create" class="echo-btn">Create Your First Echo</a>
    </div>
    <div class="echo-divider"></div>
    <p class="echo-text">
      Your journal is completely private. No social feeds, no sharing — just your
      memories, your music, your space.
    </p>
  `);
}

export function signinEmailHtml(appUrl: string): string {
  return wrap(`
    <h1 class="echo-heading">Sign in to Echo</h1>
    <p class="echo-text">
      A sign-in was requested for your Echo account. If this was you, click the
      button below to continue.
    </p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${appUrl}/login" class="echo-btn">Sign In</a>
    </div>
    <p class="echo-text" style="margin-top: 16px; font-size: 13px;">
      If you didn't request this, you can safely ignore this email.
    </p>
  `);
}

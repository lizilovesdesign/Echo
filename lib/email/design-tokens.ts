// Design Tokens for Email Templates
// Mapped from Color-Style/tokens/tokens.css (light theme) and Typography-tokens.json.
// HSL values used directly for maximum email client compatibility.

export const tokens = {
  color: {
    bg: 'hsl(7, 100%, 98%)',
    card: '#FFFFFF',
    text: 'hsl(9, 12%, 11%)',
    muted: 'hsl(0, 1%, 28%)',
    subtle: 'hsl(0, 1%, 47%)',
    border: 'hsl(15, 4%, 78%)',
    btnBg: 'hsl(9, 100%, 70%)',
    btnText: 'hsl(0, 0%, 100%)',
    footerBg: 'hsl(8, 40%, 92%)',
  },
  font: {
    family: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    title: { size: '20px', weight: '500', lineHeight: '30px', letterSpacing: '-0.3px' },
    heading: { size: '24px', weight: '500', lineHeight: '36px', letterSpacing: '-0.36px' },
    body: { size: '14px', weight: '400', lineHeight: '21px', letterSpacing: '-0.21px' },
    small: { size: '12px', weight: '400', lineHeight: '18px', letterSpacing: '-0.18px' },
    label: { size: '14px', weight: '500', lineHeight: '21px', letterSpacing: '-0.21px' },
  },
  spacing: {
    outerPadding: '40px 16px',
    cardPadding: '40px 32px',
    buttonPadding: '12px 32px',
    borderRadius: '12px',
    buttonRadius: '999px',
  },
} as const;

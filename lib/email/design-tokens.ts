// Design Tokens for Email Templates
// Resolved values from Color-Style/tokens/tokens.css (dark theme)
// and Color-Style/tokens/Typography-tokens.json.
// CSS custom properties aren't supported in email clients,
// so these are inlined as the resolved HSL values.

export const tokens = {
  color: {
    primary: 'hsl(9, 100%, 70%)',
    onPrimary: 'hsl(5, 96%, 20%)',
    primaryContainer: 'hsl(8, 74%, 30%)',
    onPrimaryContainer: 'hsl(8, 100%, 92%)',
    surface: 'hsl(9, 12%, 6%)',
    onSurface: 'hsl(8, 29%, 90%)',
    surfaceContainerLow: 'hsl(9, 12%, 11%)',
    surfaceContainer: 'hsl(9, 12%, 12%)',
    surfaceContainerHigh: 'hsl(8, 10%, 17%)',
    onSurfaceVariant: 'hsl(15, 4%, 78%)',
    outline: 'hsl(0, 1%, 57%)',
    outlineVariant: 'hsl(0, 1%, 28%)',
    surfaceContainerLowest: 'hsl(9, 12%, 4%)',
  },
  font: {
    family: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    heading: {
      size: '20px',
      weight: '500',
      lineHeight: '30px',
      letterSpacing: '-0.3px',
    },
    body: {
      size: '14px',
      weight: '400',
      lineHeight: '21px',
      letterSpacing: '-0.21px',
    },
    small: {
      size: '12px',
      weight: '400',
      lineHeight: '18px',
      letterSpacing: '-0.18px',
    },
    label: {
      size: '14px',
      weight: '500',
      lineHeight: '21px',
      letterSpacing: '-0.21px',
    },
  },
  spacing: {
    cardPadding: '32px',
    containerPadding: '40px 24px',
    buttonPadding: '12px 24px',
    borderRadius: '12px',
    buttonRadius: '8px',
  },
} as const;

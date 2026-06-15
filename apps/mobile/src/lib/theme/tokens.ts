export const tokens = {
  colors: {
    light: {
      primary: 'hsl(9, 100%, 70%)',
      onPrimary: 'hsl(0, 0%, 100%)',
      primaryContainer: 'hsl(9, 100%, 83%)',
      onPrimaryContainer: 'hsl(8, 74%, 30%)',
      background: 'hsl(7, 100%, 98%)',
      onBackground: 'hsl(9, 12%, 11%)',
      surface: 'hsl(7, 100%, 98%)',
      onSurface: 'hsl(9, 12%, 11%)',
      surfaceVariant: 'hsl(0, 9%, 89%)',
      onSurfaceVariant: 'hsl(0, 1%, 28%)',
      outlineVariant: 'hsl(15, 4%, 78%)',
      error: 'hsl(3, 71%, 41%)',
    },
    dark: {
      primary: 'hsl(9, 100%, 70%)',
      onPrimary: 'hsl(5, 96%, 20%)',
      primaryContainer: 'hsl(8, 74%, 30%)',
      onPrimaryContainer: 'hsl(8, 100%, 92%)',
      background: 'hsl(9, 12%, 6%)',
      onBackground: 'hsl(8, 29%, 90%)',
      surface: 'hsl(9, 12%, 6%)',
      onSurface: 'hsl(8, 29%, 90%)',
      surfaceVariant: 'hsl(0, 1%, 28%)',
      onSurfaceVariant: 'hsl(15, 4%, 78%)',
      outlineVariant: 'hsl(0, 1%, 28%)',
      error: 'hsl(3, 100%, 81%)',
    },
  },
  radius: {
    small: 4,
    interactive: 8,
    container: 12,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
};

export type ThemeColors = typeof tokens.colors.light;

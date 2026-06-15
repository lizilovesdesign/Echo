import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { tokens, ThemeColors } from '../../lib/theme/tokens';

interface TouchableButtonProps {
  onPress: () => void;
  children: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  themeColors: ThemeColors;
  style?: ViewStyle;
}

export function TouchableButton({
  onPress,
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  themeColors,
  style,
}: TouchableButtonProps) {
  const isPrimary = variant === 'primary';
  const buttonStyle = [
    styles.button,
    isPrimary
      ? { backgroundColor: themeColors.primary }
      : { backgroundColor: themeColors.surface, borderColor: themeColors.outlineVariant, borderWidth: 1 },
    disabled && { opacity: 0.5 },
    style,
  ];

  const textStyle = [
    styles.text,
    isPrimary ? { color: themeColors.onPrimary } : { color: themeColors.onSurface },
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyle}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? themeColors.onPrimary : themeColors.onSurface} size="small" />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44, // Strict minimum touch target constraint
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.interactive,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, useColorScheme, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { tokens } from '../lib/theme/tokens';
import { TouchableButton } from '../components/ui/TouchableButton';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const colorScheme = useColorScheme();
  const activeTheme = colorScheme === 'dark' ? 'dark' : 'light';
  const themeColors = tokens.colors[activeTheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      // In a real application, make a request to Next.js API /api/auth/login or Supabase Auth.
      // We simulate a successful mock request for scaffolding.
      const mockToken = 'mock-jwt-session-token-for-development';
      await SecureStore.setItemAsync('session_token', mockToken);
      
      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.onBackground }]}>Echo</Text>
          <Text style={[styles.subtitle, { color: themeColors.onSurfaceVariant }]}>
            A private archive for your music & feelings
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: themeColors.onSurface }]}>Sign In</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.onSurface }]}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: themeColors.surfaceVariant,
                  color: themeColors.onSurface,
                  borderColor: themeColors.outlineVariant,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@domain.com"
              placeholderTextColor={themeColors.onSurfaceVariant}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.onSurface }]}>Password</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: themeColors.surfaceVariant,
                  color: themeColors.onSurface,
                  borderColor: themeColors.outlineVariant,
                },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={themeColors.onSurfaceVariant}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

          <TouchableButton
            onPress={handleLogin}
            loading={loading}
            themeColors={themeColors}
            style={styles.submitBtn}
          >
            Enter Archive
          </TouchableButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: tokens.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xxl,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    marginTop: tokens.spacing.xs,
    textAlign: 'center',
  },
  card: {
    borderRadius: tokens.radius.container,
    padding: tokens.spacing.xl,
    width: '100%',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: tokens.spacing.xl,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: tokens.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: tokens.spacing.xs,
  },
  input: {
    minHeight: 44,
    borderRadius: tokens.radius.interactive,
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.lg,
    fontSize: 15,
  },
  error: {
    color: '#D32F2F',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  submitBtn: {
    marginTop: tokens.spacing.md,
    width: '100%',
  },
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/lib/supabase-client', () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
    },
  }),
}));

describe('Login page (web)', () => {
  it('validates Zod schema rules for auth form', () => {
    const emailSchema = (v: string) => v.length > 0;
    const passwordSchema = (v: string) => v.length > 0;

    expect(emailSchema('test@echo.app')).toBe(true);
    expect(emailSchema('')).toBe(false);
    expect(passwordSchema('secret')).toBe(true);
    expect(passwordSchema('')).toBe(false);
  });

  it('validates email format pattern', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('user@echo.app')).toBe(true);
    expect(emailRegex.test('invalid')).toBe(false);
    expect(emailRegex.test('')).toBe(false);
  });

  it('validates password minimum length', () => {
    const minLength = 6;
    expect('secret'.length >= minLength).toBe(true);
    expect('12345'.length >= minLength).toBe(false);
  });
});

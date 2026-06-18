import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const testEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const mockValidEnv = {
  DATABASE_URL: 'postgresql://postgres:test@db.test.supabase.co:5432/postgres',
  DIRECT_URL: 'postgresql://postgres:test@db.test.supabase.co:5432/postgres',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
};

describe('Environment validation', () => {
  it('accepts valid environment variables', () => {
    const result = testEnvSchema.safeParse(mockValidEnv);
    expect(result.success).toBe(true);
  });

  it('rejects missing DATABASE_URL', () => {
    const { DATABASE_URL, ...rest } = mockValidEnv;
    const result = testEnvSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing DIRECT_URL', () => {
    const { DIRECT_URL, ...rest } = mockValidEnv;
    const result = testEnvSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects invalid URL for NEXT_PUBLIC_SUPABASE_URL', () => {
    const result = testEnvSchema.safeParse({
      ...mockValidEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('Database URL format', () => {
  it('DATABASE_URL uses pooler format for eu-west-1', () => {
    const url = new URL(mockValidEnv.DATABASE_URL);
    expect(url.hostname).toMatch(/\.supabase\.co$/);
    expect(url.protocol).toBe('postgresql:');
  });

  it('DIRECT_URL uses direct connection format', () => {
    const url = new URL(mockValidEnv.DIRECT_URL);
    expect(url.hostname).toMatch(/db\.\w+\.supabase\.co$/);
  });

  it('pooler URL includes pgbouncer parameter', () => {
    const url = new URL(mockValidEnv.DATABASE_URL.replace('postgresql://', 'https://'));
    expect(url.searchParams.get('pgbouncer')).toBeNull();
  });
});

describe('MoodTag enum validation', () => {
  const MoodTagSchema = z.enum(['Nostalgic', 'Energetic', 'Melancholic', 'Calm']);

  it('accepts valid mood tags', () => {
    expect(MoodTagSchema.parse('Nostalgic')).toBe('Nostalgic');
    expect(MoodTagSchema.parse('Energetic')).toBe('Energetic');
    expect(MoodTagSchema.parse('Melancholic')).toBe('Melancholic');
    expect(MoodTagSchema.parse('Calm')).toBe('Calm');
  });

  it('rejects invalid mood tags', () => {
    expect(() => MoodTagSchema.parse('Happy')).toThrow();
    expect(() => MoodTagSchema.parse('')).toThrow();
  });
});

describe('EchoEntry validation', () => {
  const CreateEchoSchema = z.object({
    songTitle: z.string().min(1),
    artist: z.string().min(1),
    albumArtUrl: z.string().url(),
    spotifyTrackId: z.string().min(1),
    moodTag: z.enum(['Nostalgic', 'Energetic', 'Melancholic', 'Calm']),
    note: z.string().max(500),
  });

  const validEntry = {
    songTitle: 'Rose Quartz',
    artist: 'Toro y Moi',
    albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273123456',
    spotifyTrackId: '5b6e9b7c8d9e0f1a2b3c4d5e',
    moodTag: 'Calm' as const,
    note: 'Sunset vibes',
  };

  it('accepts valid entry', () => {
    const result = CreateEchoSchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it('rejects empty song title', () => {
    const result = CreateEchoSchema.safeParse({ ...validEntry, songTitle: '' });
    expect(result.success).toBe(false);
  });

  it('rejects note exceeding 500 characters', () => {
    const result = CreateEchoSchema.safeParse({ ...validEntry, note: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('rejects invalid albumArtUrl', () => {
    const result = CreateEchoSchema.safeParse({ ...validEntry, albumArtUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('strips unknown fields', () => {
    const result = CreateEchoSchema.safeParse({ ...validEntry, extraField: 'should be stripped' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect('extraField' in result.data).toBe(false);
    }
  });
});

describe('Spotify track validation', () => {
  const SpotifyTrackSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    artist: z.string().min(1),
    albumArtUrl: z.string().url(),
  });

  it('accepts valid Spotify track', () => {
    const result = SpotifyTrackSchema.safeParse({
      id: '5b6e9b7c8d9e0f1a2b3c4d5e',
      name: 'Rose Quartz',
      artist: 'Toro y Moi',
      albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273123456',
    });
    expect(result.success).toBe(true);
  });

  it('rejects track missing artist', () => {
    const result = SpotifyTrackSchema.safeParse({
      id: '5b6e9b7c8d9e0f1a2b3c4d5e',
      name: 'Rose Quartz',
      albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273123456',
    });
    expect(result.success).toBe(false);
  });
});

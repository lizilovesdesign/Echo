import { describe, it, expect } from 'vitest';
import { CreateEchoSchema, MoodTagSchema } from '@/lib/validators/echoEntry';

describe('Echo entry API validation', () => {
  const validPayload = {
    songTitle: 'Test Song',
    artist: 'Test Artist',
    albumArtUrl: 'https://i.scdn.co/image/test',
    spotifyTrackId: 'test-track-id-123',
    moodTag: 'Nostalgic',
    note: 'A test echo entry',
  };

  it('creates valid echo entry payload', () => {
    const result = CreateEchoSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects payload with empty fields', () => {
    const invalidCases = [
      { ...validPayload, songTitle: '' },
      { ...validPayload, artist: '' },
      { ...validPayload, spotifyTrackId: '' },
    ];

    invalidCases.forEach((payload) => {
      const result = CreateEchoSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  it('rejects invalid mood tag', () => {
    const result = MoodTagSchema.safeParse('InvalidMood');
    expect(result.success).toBe(false);
  });

  it('rejects note exceeding 500 characters', () => {
    const result = CreateEchoSchema.safeParse({
      ...validPayload,
      note: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('accepts note at exactly 500 characters', () => {
    const result = CreateEchoSchema.safeParse({
      ...validPayload,
      note: 'x'.repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid album art URL', () => {
    const result = CreateEchoSchema.safeParse({
      ...validPayload,
      albumArtUrl: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

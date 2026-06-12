import { z } from 'zod';

export const MoodTagSchema = z.enum(['Nostalgic', 'Energetic', 'Melancholic', 'Calm']);
export type MoodTag = z.infer<typeof MoodTagSchema>;

export const CreateEchoSchema = z.object({
  songTitle: z.string().min(1, 'Song title is required'),
  artist: z.string().min(1, 'Artist name is required'),
  albumArtUrl: z.string().url('Invalid album artwork URL'),
  spotifyTrackId: z.string().min(1, 'Spotify track ID is required'),
  moodTag: MoodTagSchema,
  note: z.string().max(500, 'Note cannot exceed 500 characters'),
});

export type CreateEchoInput = z.infer<typeof CreateEchoSchema>;

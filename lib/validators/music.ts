import { z } from 'zod';

export const MusicTrackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  artist: z.string().min(1),
  albumArtUrl: z.string().url(),
  source: z.enum(['spotify']),
  previewUrl: z.string().nullable().optional(),
  entryType: z.enum(['song', 'album']).optional().default('song'),
  albumName: z.string().optional(),
  albumId: z.string().optional(),
});

export type MusicTrack = z.infer<typeof MusicTrackSchema>;

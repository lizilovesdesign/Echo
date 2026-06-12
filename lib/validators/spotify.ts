import { z } from 'zod';

export const SpotifyTrackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  artist: z.string().min(1),
  albumArtUrl: z.string().url(),
});

export type SpotifyTrack = z.infer<typeof SpotifyTrackSchema>;

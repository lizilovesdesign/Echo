import { create } from 'zustand';
import { MusicTrack } from '../validators/music';
import { MoodTag } from '../validators/echoEntry';

interface EntryStore {
  selectedTrack: MusicTrack | null;
  note: string;
  moodTag: MoodTag | null;
  stickers: string[];
  editingEntryId: string | null;
  setSelectedTrack: (track: MusicTrack | null) => void;
  setNote: (note: string) => void;
  setMoodTag: (mood: MoodTag | null) => void;
  setStickers: (stickers: string[]) => void;
  prefillFromEntry: (data: {
    id: string;
    songTitle: string;
    artist: string;
    albumArtUrl: string;
    spotifyTrackId: string;
    previewUrl: string | null;
    entryType?: string;
    albumName?: string | null;
    spotifyAlbumId?: string | null;
    moodTag: MoodTag;
    note: string;
    stickers: string[];
  }) => void;
  clearEntry: () => void;
}

export const useEntryStore = create<EntryStore>((set) => ({
  selectedTrack: null,
  note: '',
  moodTag: null,
  stickers: [],
  editingEntryId: null,
  setSelectedTrack: (track) => set({ selectedTrack: track }),
  setNote: (note) => set({ note }),
  setMoodTag: (mood) => set({ moodTag: mood }),
  setStickers: (stickers) => set({ stickers }),
  prefillFromEntry: (data) =>
    set({
      selectedTrack: {
        id: data.spotifyTrackId,
        name: data.songTitle,
        artist: data.artist,
        albumArtUrl: data.albumArtUrl,
        previewUrl: data.previewUrl,
        source: 'spotify',
        entryType: (data.entryType as 'song' | 'album') || 'song',
        albumName: data.albumName ?? undefined,
        albumId: data.spotifyAlbumId ?? undefined,
      },
      note: data.note,
      moodTag: data.moodTag,
      stickers: data.stickers,
      editingEntryId: data.id,
    }),
  clearEntry: () => set({ selectedTrack: null, note: '', moodTag: null, stickers: [], editingEntryId: null }),
}));

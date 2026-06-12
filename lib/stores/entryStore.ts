import { create } from 'zustand';
import { SpotifyTrack } from '../validators/spotify';

interface EntryStore {
  selectedTrack: SpotifyTrack | null;
  setSelectedTrack: (track: SpotifyTrack | null) => void;
  clearEntry: () => void;
}

export const useEntryStore = create<EntryStore>((set) => ({
  selectedTrack: null,
  setSelectedTrack: (track) => set({ selectedTrack: track }),
  clearEntry: () => set({ selectedTrack: null }),
}));

import { create } from 'zustand';
import { MusicTrack } from '../validators/music';

interface EntryStore {
  selectedTrack: MusicTrack | null;
  setSelectedTrack: (track: MusicTrack | null) => void;
  clearEntry: () => void;
}

export const useEntryStore = create<EntryStore>((set) => ({
  selectedTrack: null,
  setSelectedTrack: (track) => set({ selectedTrack: track }),
  clearEntry: () => set({ selectedTrack: null }),
}));

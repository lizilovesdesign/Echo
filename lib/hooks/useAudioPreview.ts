'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioPreviewReturn {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  play: (previewUrl: string | null, trackId?: string) => Promise<void>;
  stop: () => void;
  toggle: (previewUrl: string | null, trackId?: string) => Promise<void>;
}

export function useAudioPreview(): UseAudioPreviewReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(async (previewUrl: string | null, trackId?: string) => {
    stop();
    setHasError(false);

    let url = previewUrl;

    if (!url && trackId) {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/music/track/${trackId}`);
        if (res.ok) {
          const json = await res.json();
          url = json.data?.previewUrl;
        }
      } catch {
        setHasError(true);
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    if (!url) {
      setHasError(true);
      return;
    }

    const audio = new Audio(url);
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      audioRef.current = null;
    });
    audio.play().catch(() => {
      setHasError(true);
      setIsPlaying(false);
    });
    audioRef.current = audio;
    setIsPlaying(true);
  }, [stop]);

  const toggle = useCallback(async (previewUrl: string | null, trackId?: string) => {
    if (audioRef.current) {
      stop();
    } else {
      await play(previewUrl, trackId);
    }
  }, [stop, play]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { isPlaying, isLoading, hasError, play, stop, toggle };
}

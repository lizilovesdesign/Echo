'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MusicNote01Icon, MusicNote02Icon } from 'hugeicons-react';
import styles from './NowPlaying.module.css';

interface CurrentlyPlaying {
  isPlaying: boolean;
  trackId: string;
  trackName: string;
  artist: string;
  albumArtUrl: string;
  previewUrl: string | null;
  progressMs: number;
  durationMs: number;
}

interface NowPlayingData {
  connected: boolean;
  currentlyPlaying: CurrentlyPlaying | null;
}

export function NowPlaying() {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [lastTrack, setLastTrack] = useState<{ trackName: string; artist: string } | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNowPlaying = useCallback(async () => {
    try {
      const res = await fetch('/api/music/now-playing');
      if (!res.ok) {
        setHasError(true);
        return;
      }
      const json = await res.json();
      if (json.ok) {
        setData(json.data);
        setHasError(false);
        const cp = json.data.currentlyPlaying;
        if (cp && cp.trackName) {
          setLastTrack({ trackName: cp.trackName, artist: cp.artist });
        }
      }
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNowPlaying();
    pollingRef.current = setInterval(fetchNowPlaying, 60000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchNowPlaying]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (hasError && !data) {
    return null;
  }

  if (!data?.connected) {
    return (
      <div className={styles.container}>
        <a href="/api/auth/spotify/link" className={styles.connectPrompt}>
          <MusicNote01Icon size={18} className={styles.icon} />
          <span>Connect Spotify to share what you&apos;re listening to</span>
          <span className={styles.arrow}>→</span>
        </a>
      </div>
    );
  }

  const currentlyPlaying = data.currentlyPlaying;

  if (!currentlyPlaying) {
    return (
      <div className={styles.container}>
        <div className={styles.listeningBar}>
          <MusicNote02Icon size={16} className={styles.mutedIcon} />
          <span className={styles.mutedText}>
            {lastTrack ? (
              <>Was listening to <strong>{lastTrack.trackName}</strong> by {lastTrack.artist}</>
            ) : (
              'Was listening too...'
            )}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.listeningBar}>
        <span className={styles.indicators}>
          <span className={styles.animatedNote} aria-hidden="true">🎵</span>
          {currentlyPlaying.isPlaying && <span className={styles.playingDot} />}
        </span>
        <span className={styles.trackText}>
          {currentlyPlaying.isPlaying ? 'Listening to ' : 'Paused on '}
          <strong>{currentlyPlaying.trackName}</strong> by {currentlyPlaying.artist}
        </span>
      </div>
    </div>
  );
}

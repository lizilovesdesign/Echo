'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './TopItemsView.module.css';

type TabKey = 'artists' | 'tracks' | 'albums';
type TimeRange = 'short_term' | 'medium_term' | 'long_term';

interface TopItem {
  id: string;
  name: string;
  image: string;
  artist?: string;
  genres?: string[];
  popularity?: number;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'artists', label: 'Artists' },
  { key: 'tracks', label: 'Songs' },
  { key: 'albums', label: 'Albums' },
];

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: 'short_term', label: '4 weeks' },
  { key: 'medium_term', label: '6 months' },
  { key: 'long_term', label: 'All time' },
];

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function rankSubtitle(item: TopItem, isArtist: boolean): string {
  if (isArtist) {
    return item.genres && item.genres.length > 0 ? capitalize(item.genres[0]) : '';
  }
  return item.artist ?? '';
}

export function TopItemsView() {
  const [activeTab, setActiveTab] = useState<TabKey>('artists');
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [items, setItems] = useState<TopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [needsReauth, setNeedsReauth] = useState(false);

  const fetchTopItems = useCallback(async (tab: TabKey, range: TimeRange) => {
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await fetch(`/api/music/top-items?type=${tab}&time_range=${range}&limit=5`);
      if (!res.ok) {
        setHasError(true);
        return;
      }
      const json = await res.json();
      if (json.ok) {
        setIsConnected(json.data.connected);
        setNeedsReauth(json.data.needsReauth ?? false);
        setItems(json.data.items);
      } else {
        setHasError(true);
      }
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopItems(activeTab, timeRange);
  }, [activeTab, timeRange, fetchTopItems]);

  if (!isConnected) {
    return (
      <div className={styles.connectCard}>
        <p className={styles.connectTitle}>Connect Spotify first</p>
        <p className={styles.connectDesc}>Link your account to discover your listening personality.</p>
        <a href="/api/auth/spotify/link" className={styles.connectBtn}>Connect Spotify</a>
      </div>
    );
  }

  if (needsReauth) {
    return (
      <div className={styles.connectCard}>
        <p className={styles.connectTitle}>Permissions needed</p>
        <p className={styles.connectDesc}>Reconnect Spotify to unlock your top items.</p>
        <a href="/api/auth/spotify/link" className={styles.connectBtn}>Reconnect</a>
      </div>
    );
  }

  const isArtist = activeTab === 'artists';

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.timeRangeRow}>
        {TIME_RANGES.map((tr) => (
          <button
            key={tr.key}
            className={`${styles.timeRangeBtn} ${timeRange === tr.key ? styles.timeRangeActive : ''}`}
            onClick={() => setTimeRange(tr.key)}
          >
            {tr.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.skeleton} role="status" aria-live="polite">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skelRow}>
              <div className={styles.skelBadge} />
              <div className={styles.skelArt} />
              <div className={styles.skelText}>
                <div className={styles.skelLine} />
                <div className={styles.skelLineShort} />
              </div>
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className={styles.error}>Something went wrong. Give it another shot.</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>Nothing here yet. Keep listening!</div>
      ) : (
        <ol className={styles.rankList} role="tabpanel">
          {items.map((item, idx) => (
            <li key={item.id} className={styles.rankItem}>
              <span className={styles.rankBadge}>{idx + 1}</span>
              <div className={`${styles.rankImageWrap} ${isArtist ? styles.circleImage : styles.squareImage}`}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="44px"
                  className={styles.rankImage}
                  unoptimized
                />
              </div>
              <div className={styles.rankInfo}>
                <span className={styles.rankName}>{item.name}</span>
                {rankSubtitle(item, isArtist) && (
                  <span className={styles.rankSubtitle}>{rankSubtitle(item, isArtist)}</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

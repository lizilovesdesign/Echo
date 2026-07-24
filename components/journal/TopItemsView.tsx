'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { MusicNote01Icon } from 'hugeicons-react';
import styles from './TopItemsView.module.css';

type TabKey = 'artists' | 'tracks';
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
];

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: 'short_term', label: '4 weeks' },
  { key: 'medium_term', label: '6 months' },
  { key: 'long_term', label: 'All time' },
];

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
      const res = await fetch(`/api/music/top-items?type=${tab}&time_range=${range}&limit=20`);
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
      <div className={styles.connectPrompt}>
        <MusicNote01Icon size={18} className={styles.connectIcon} />
        <span>Connect Spotify to see your top items</span>
        <a href="/api/auth/spotify/link" className={styles.connectLink}>Connect</a>
      </div>
    );
  }

  if (needsReauth) {
    return (
      <div className={styles.connectPrompt}>
        <MusicNote01Icon size={18} className={styles.connectIcon} />
        <span>Reconnect Spotify to access your top items</span>
        <a href="/api/auth/spotify/link" className={styles.connectLink}>Reconnect</a>
      </div>
    );
  }

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
        <div className={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonText} />
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className={styles.error}>Something went wrong. Please try again.</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>No data available for this period.</div>
      ) : (
        <div className={styles.list} role="tabpanel">
          {items.map((item, index) => (
            <div key={item.id} className={styles.row}>
              <span className={styles.rank}>{index + 1}</span>
              <div className={styles.imageWrapper}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className={styles.image}
                  unoptimized
                />
              </div>
              <div className={styles.info}>
                <span className={styles.name}>{item.name}</span>
                {item.artist && <span className={styles.artist}>{item.artist}</span>}
                {item.genres && item.genres.length > 0 && (
                  <span className={styles.genre}>{item.genres[0]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

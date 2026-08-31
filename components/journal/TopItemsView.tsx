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

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'artists', label: 'Artists', emoji: '🎤' },
  { key: 'tracks', label: 'Songs', emoji: '🎵' },
  { key: 'albums', label: 'Albums', emoji: '💿' },
];

const TIME_RANGES: { key: string; label: string; apiRange: TimeRange }[] = [
  { key: 'this_week', label: 'This week', apiRange: 'short_term' },
  { key: 'last_week', label: 'Last week', apiRange: 'short_term' },
  { key: 'last_month', label: 'Last month', apiRange: 'medium_term' },
  { key: 'all_time', label: 'All time', apiRange: 'long_term' },
];

const TAB_HEADLINES: Record<TabKey, string> = {
  artists: 'Your Top Artists',
  tracks: 'Your Top Tracks',
  albums: 'Your Top Albums',
};

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
  const [timeRangeKey, setTimeRangeKey] = useState<string>('this_week');
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
    const range = TIME_RANGES.find(tr => tr.key === timeRangeKey)?.apiRange ?? 'short_term';
    fetchTopItems(activeTab, range);
  }, [activeTab, timeRangeKey, fetchTopItems]);

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
  const heroItem = items.length > 0 ? items[0] : null;

  const renderListItem = (item: TopItem, idx: number) => {
    const subtitle = rankSubtitle(item, isArtist);
    return (
      <li key={item.id} className={styles.rankItem}>
        <span className={styles.rankNumber}>{idx + 1}</span>
        <div className={styles.rankContent}>
          <div className={`${styles.rankImageWrap} ${isArtist ? styles.circleImage : styles.squareImage}`}>
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="64px"
              className={styles.rankImage}
              unoptimized
            />
          </div>
          <div className={styles.rankInfo}>
            <span className={styles.rankName}>{item.name}</span>
            {subtitle && <span className={styles.rankSubtitle}>{subtitle}</span>}
          </div>
        </div>
      </li>
    );
  };

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
            <span className={styles.tabEmoji}>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.timeRangeRow}>
        {TIME_RANGES.map((tr) => (
          <button
            key={tr.key}
            className={`${styles.timeRangeBtn} ${timeRangeKey === tr.key ? styles.timeRangeActive : ''}`}
            onClick={() => setTimeRangeKey(tr.key)}
          >
            {tr.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.skeleton} role="status" aria-live="polite">
          <div className={styles.skelHero} />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skelRow}>
              <div className={styles.skelNumber} />
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
        <div className={styles.recapContainer}>
          <h2 className={styles.recapHeadline}>{TAB_HEADLINES[activeTab]}</h2>
          
          {heroItem && (
            <div className={styles.heroSection}>
              <div className={`${styles.heroImageWrap} ${isArtist ? styles.heroCircle : styles.heroSquare}`}>
                <Image
                  src={heroItem.image}
                  alt={heroItem.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className={styles.heroImage}
                  priority
                  unoptimized
                />
              </div>
            </div>
          )}

          <ol className={styles.rankList}>
            {items.map((item, idx) => renderListItem(item, idx))}
          </ol>
          
          <div className={styles.collageGrid}>
            {items.slice(0, 5).map((item) => (
              <div key={`collage-${item.id}`} className={styles.collageItem}>
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="100px"
                  className={styles.collageImage}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

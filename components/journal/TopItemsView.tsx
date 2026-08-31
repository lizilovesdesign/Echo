'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './TopItemsView.module.css';

type TabKey = 'artists' | 'tracks' | 'albums' | 'genres';
type TimeRange = 'short_term' | 'medium_term' | 'long_term';

interface TopItem {
  id: string;
  name: string;
  image: string;
  artist?: string;
  genres?: string[];
  popularity?: number;
}

interface TopGenre {
  id: string;
  name: string;
  artistCount: number;
  weight: number;
  swatches: string[];
}

interface DisplayItem {
  id: string;
  name: string;
  subtitle: string;
  images: string[];
  isCircle: boolean;
}

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'artists', label: 'Artists', emoji: '🎤' },
  { key: 'tracks', label: 'Songs', emoji: '🎵' },
  { key: 'genres', label: 'Genres', emoji: '🎧' },
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
  genres: 'Your Top Genres',
};

function titleCase(value: string): string {
  return value
    .split(/[\s/]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function rankSubtitle(item: TopItem, isArtist: boolean): string {
  if (isArtist) {
    return item.genres && item.genres.length > 0 ? titleCase(item.genres[0]) : '';
  }
  return item.artist ?? '';
}

function isTopGenre(item: TopItem | TopGenre): item is TopGenre {
  return 'swatches' in item;
}

export function TopItemsView() {
  const [activeTab, setActiveTab] = useState<TabKey>('artists');
  const [timeRangeKey, setTimeRangeKey] = useState<string>('this_week');
  const [items, setItems] = useState<TopItem[] | TopGenre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [needsReauth, setNeedsReauth] = useState(false);

  const switchTab = (tab: TabKey) => {
    // Clear items immediately so stale data never renders under the new tab's logic
    setItems([]);
    setActiveTab(tab);
  };

  const fetchTopItems = useCallback(async (tab: TabKey, range: TimeRange) => {
    setIsLoading(true);
    setHasError(false);
    setItems([]);
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
    const range = TIME_RANGES.find((tr) => tr.key === timeRangeKey)?.apiRange ?? 'short_term';
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
  const isGenre = activeTab === 'genres';

  const toDisplayItem = (item: TopItem | TopGenre): DisplayItem => {
    // Runtime guard — never rely on activeTab alone since items may still be stale
    if (isTopGenre(item)) {
      return {
        id: item.id,
        name: titleCase(item.name),
        subtitle: `${item.artistCount} artist${item.artistCount === 1 ? '' : 's'}`,
        images: item.swatches,
        isCircle: false,
      };
    }
    return {
      id: item.id,
      name: item.name,
      subtitle: rankSubtitle(item, isArtist),
      images: item.image ? [item.image] : [],
      isCircle: isArtist,
    };
  };

  const displayItems = items.map(toDisplayItem);
  const heroItem = displayItems.length > 0 ? displayItems[0] : null;

  const collageImages = items
    .flatMap((item) => (isTopGenre(item) ? item.swatches : [item.image]))
    .filter(Boolean)
    .slice(0, 5) as string[];

  const renderThumb = (item: DisplayItem) => {
    if (item.images.length <= 1) {
      return (
        <div className={`${styles.rankImageWrap} ${item.isCircle ? styles.circleImage : styles.squareImage}`}>
          {item.images[0] && (
            <Image src={item.images[0]} alt="" fill sizes="64px" className={styles.rankImage} unoptimized />
          )}
        </div>
      );
    }
    return (
      <div className={styles.swatchGrid}>
        {item.images.slice(0, 4).map((src, i) => (
          <div key={i} className={styles.swatchTile}>
            <Image src={src} alt="" fill sizes="32px" className={styles.rankImage} unoptimized />
          </div>
        ))}
      </div>
    );
  };

  const renderListItem = (item: DisplayItem, idx: number) => (
    <li key={item.id} className={styles.rankItem}>
      <span className={styles.rankNumber}>{idx + 1}</span>
      <div className={styles.rankContent}>
        {renderThumb(item)}
        <div className={styles.rankInfo}>
          <span className={styles.rankName}>{item.name}</span>
          {item.subtitle && <span className={styles.rankSubtitle}>{item.subtitle}</span>}
        </div>
      </div>
    </li>
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => switchTab(tab.key)}
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
              {heroItem.images.length <= 1 ? (
                <div className={`${styles.heroImageWrap} ${heroItem.isCircle ? styles.heroCircle : styles.heroSquare}`}>
                  {heroItem.images[0] && (
                    <Image
                      src={heroItem.images[0]}
                      alt={heroItem.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className={styles.heroImage}
                      priority
                      unoptimized
                    />
                  )}
                </div>
              ) : (
                <div className={styles.heroSwatchGrid}>
                  {heroItem.images.slice(0, 4).map((src, i) => (
                    <div key={i} className={styles.heroSwatchTile}>
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="160px"
                        className={styles.heroImage}
                        priority
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <ol className={styles.rankList}>
            {displayItems.map((item, idx) => renderListItem(item, idx))}
          </ol>

          {collageImages.length > 0 && (
            <div className={styles.collageGrid}>
              {collageImages.map((src, i) => (
                <div key={`collage-${i}`} className={styles.collageItem}>
                  <Image src={src} alt="" fill sizes="100px" className={styles.collageImage} unoptimized />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

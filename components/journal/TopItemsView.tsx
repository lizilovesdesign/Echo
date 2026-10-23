'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './TopItemsView.module.css';

type TabKey = 'artists' | 'tracks' | 'albums';
type TimeRange = 'short_term' | 'medium_term';

interface TopItem {
  id: string;
  name: string;
  image: string;
  artist?: string;
}

interface DisplayItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  isCircle: boolean;
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
];

const TAB_HEADLINES: Record<TabKey, string> = {
  artists: 'Your Top Artists',
  tracks: 'Your Top Tracks',
  albums: 'Your Top Albums',
};

export function TopItemsView() {
  const [activeTab, setActiveTab] = useState<TabKey>('artists');
  const [timeRangeKey, setTimeRangeKey] = useState<string>('this_week');
  const [items, setItems] = useState<TopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [needsReauth, setNeedsReauth] = useState(false);

  const switchTab = (tab: TabKey) => {
    // Clear stale data immediately so no stale items/state are processed under the new tab
    setItems([]);
    setHasError(false);
    setNeedsReauth(false);
    setActiveTab(tab);
  };

  const fetchTopItems = useCallback(async (tab: TabKey, range: TimeRange) => {
    try {
      setIsLoading(true);
      setHasError(false);

      const response = await fetch(`/api/music/top-items?type=${tab}&time_range=${range}&limit=20`, {
        cache: 'no-store',
      });

      if (response.status === 401) {
        setIsConnected(false);
        setItems([]);
        return;
      }

      if (response.status === 403) {
        setNeedsReauth(true);
        setItems([]);
        return;
      }

      const json = await response.json();
      if (!json.ok) {
        throw new Error(json.error?.message || 'Failed to load top items');
      }

      setItems(json.data.items);
    } catch (err) {
      setHasError(true);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const range = TIME_RANGES.find((r) => r.key === timeRangeKey) || TIME_RANGES[0];
    fetchTopItems(activeTab, range.apiRange);
  }, [activeTab, timeRangeKey, fetchTopItems]);

  if (!isConnected) {
    return (
      <div className={styles.connectCard}>
        <h2 className={styles.connectTitle}>Connect your Spotify</h2>
        <p className={styles.connectText}>Link your account to see your top artists, songs, and albums.</p>
        <button
          onClick={() => (window.location.href = '/api/auth/spotify')}
          className={styles.connectBtn}
        >
          Connect Spotify
        </button>
      </div>
    );
  }

  if (needsReauth) {
    return (
      <div className={styles.connectCard}>
        <h2 className={styles.connectTitle}>Session Expired</h2>
        <p className={styles.connectText}>
          For your security, please sign out and sign back in to refresh your session.
        </p>
        <button onClick={() => (window.location.href = '/signout')} className={styles.connectBtn}>
          Sign Out
        </button>
      </div>
    );
  }

  const isArtist = activeTab === 'artists';

  const toDisplayItem = (item: TopItem): DisplayItem => ({
    id: item.id,
    name: item.name,
    subtitle: isArtist ? '' : item.artist ?? '',
    image: item.image ?? '',
    isCircle: isArtist,
  });

  const displayItems = items.map(toDisplayItem);
  const heroItem = displayItems.length > 0 ? displayItems[0] : null;
  const collageImages = displayItems.map((item) => item.image).filter(Boolean).slice(0, 5);
  const activeTabConfig = TABS.find((tab) => tab.key === activeTab) ?? TABS[0];
  const activeRangeLabel = TIME_RANGES.find((range) => range.key === timeRangeKey)?.label ?? '';
  const itemNoun = activeTab === 'artists' ? 'artists' : activeTab === 'tracks' ? 'songs' : 'albums';

  return (
    <div className={styles.wrapper}>
      {/* Tabs */}
      <div className={styles.tabs} role="tablist" aria-label="Item categories">
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

      {/* Time Range Tabs */}
      <div className={styles.timeRangeRow} aria-label="Time ranges">
        {TIME_RANGES.map((range) => (
          <button
            key={range.key}
            aria-pressed={timeRangeKey === range.key}
            className={`${styles.timeRangeBtn} ${timeRangeKey === range.key ? styles.timeRangeActive : ''}`}
            onClick={() => setTimeRangeKey(range.key)}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Recap */}
      {isLoading ? (
        <div className={styles.skeleton}>
          <div className={styles.skelHero}></div>
          <div className={styles.skelRow}>
            <div className={styles.skelNumber}></div>
            <div className={styles.skelArt}></div>
            <div className={styles.skelTextGroup}>
              <div className={styles.skelLine}></div>
              <div className={`${styles.skelLine} ${styles.skelLineShort}`}></div>
            </div>
          </div>
          <div className={styles.skelRow}>
            <div className={styles.skelNumber}></div>
            <div className={styles.skelArt}></div>
            <div className={styles.skelTextGroup}>
              <div className={styles.skelLine}></div>
              <div className={`${styles.skelLine} ${styles.skelLineShort}`}></div>
            </div>
          </div>
        </div>
      ) : hasError ? (
        <div className={styles.error}>Couldn&apos;t load your top items.</div>
      ) : displayItems.length === 0 ? (
        <div className={styles.empty}>
          <p>Nothing here yet. Go make some noise! 🎧</p>
        </div>
      ) : (
        <div className={styles.recapContainer}>
          {/* Playful header */}
          <div className={styles.recapHeader}>
            <span className={styles.headlineEmoji} aria-hidden="true">
              {activeTabConfig.emoji}
            </span>
            <h2 className={styles.recapHeadline}>{TAB_HEADLINES[activeTab]}</h2>
            <p className={styles.recapSubtitle}>
              {activeRangeLabel} · {displayItems.length} {itemNoun}
            </p>
            <div className={styles.waveform} aria-hidden="true">
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
            </div>
          </div>

          {/* Hero Recap */}
          {heroItem && (
            <div className={styles.heroSection}>
              <div className={`${styles.heroImageWrap} ${heroItem.isCircle ? styles.heroCircle : styles.heroSquare}`}>
                {heroItem.image && (
                  <Image
                    src={heroItem.image}
                    alt={heroItem.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className={styles.heroImage}
                    priority
                    unoptimized
                  />
                )}
                <span className={styles.crownBadge} aria-hidden="true">
                  👑
                </span>
              </div>
              <div className={styles.heroMeta}>
                <span className={styles.heroRank}>No. 1</span>
                <span className={styles.heroName}>{heroItem.name}</span>
                {heroItem.subtitle && <span className={styles.heroSubtitle}>{heroItem.subtitle}</span>}
              </div>
            </div>
          )}

          {/* Ranked List */}
          <ol className={styles.rankList} aria-label="Your top items">
            {displayItems.map((item, index) => (
              <li
                key={item.id}
                className={`${styles.rankItem} ${index === 0 ? styles.rankFirst : ''} ${
                  index === 1 ? styles.rankSecond : ''
                } ${index === 2 ? styles.rankThird : ''}`}
                style={{ animationDelay: `${index * 50 + 150}ms` }}
              >
                <div className={styles.rankNumber}>{index + 1}</div>
                <div className={styles.rankContent}>
                  <div
                    className={`${styles.rankImageWrap} ${item.isCircle ? styles.circleImage : styles.squareImage}`}
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="56px"
                        className={styles.rankImage}
                        unoptimized
                      />
                    )}
                  </div>
                  <div className={styles.rankInfo}>
                    <div className={styles.rankName}>{item.name}</div>
                    {item.subtitle && <div className={styles.rankSubtitle}>{item.subtitle}</div>}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {/* Bottom Collage Grid */}
          {collageImages.length > 0 && (
            <div className={styles.collageBlock}>
              <p className={styles.collageCaption}>On repeat lately</p>
              <div className={styles.collageGrid} aria-hidden="true">
                {collageImages.map((img, idx) => (
                  <div key={`collage-${idx}`} className={styles.collageItem}>
                    <Image
                      src={img}
                      alt=""
                      width={64}
                      height={64}
                      className={styles.collageImage}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

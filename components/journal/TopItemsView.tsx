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

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: 'short_term', label: '4 weeks' },
  { key: 'medium_term', label: '6 months' },
  { key: 'long_term', label: 'All time' },
];

const TAB_HEADLINES: Record<TabKey, string> = {
  artists: 'Your musical obsessions',
  tracks: 'Songs on repeat',
  albums: 'Albums you can\'t stop playing',
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

function getRankBadgeClass(rank: number): string {
  if (rank === 1) return `${styles.rankBadge} ${styles.rankGold}`;
  if (rank === 2) return `${styles.rankBadge} ${styles.rankSilver}`;
  if (rank === 3) return `${styles.rankBadge} ${styles.rankBronze}`;
  return styles.rankBadge;
}

function getFunFact(popularity?: number): string {
  if (popularity === undefined) return '';
  if (popularity >= 90) return 'Absolute banger 🔥';
  if (popularity >= 75) return 'Crowd favorite ⭐';
  if (popularity >= 60) return 'Solid taste 🎶';
  if (popularity >= 40) return 'Hidden gem 💎';
  return 'Deep cut 🌱';
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
  const top3 = items.slice(0, 3);
  const rest = items.slice(3);

  const renderListItem = (item: TopItem, idx: number) => {
    const subtitle = rankSubtitle(item, isArtist);
    const funFact = getFunFact(item.popularity);
    return (
      <li key={item.id} className={styles.rankItem}>
        <span className={getRankBadgeClass(idx + 1)}>{idx + 1}</span>
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
          {subtitle && <span className={styles.rankSubtitle}>{subtitle}</span>}
        </div>
        {funFact && <span className={styles.funFact}>{funFact}</span>}
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
        <>
          {top3.length > 0 && (
            <>
              <p className={styles.podiumHeadline}>{TAB_HEADLINES[activeTab]} ✨</p>
              <div className={styles.podium} role="tabpanel">
                {top3.length >= 2 && (
                  <div className={`${styles.podiumItem} ${styles.podiumLeft}`}>
                    <div className={styles.podiumImageWrap}>
                      <Image
                        src={top3[1].image}
                        alt={top3[1].name}
                        fill
                        sizes="56px"
                        className={styles.podiumImage}
                        unoptimized
                      />
                    </div>
                    <span className={`${styles.podiumBadge} ${styles.rankSilver}`}>2</span>
                    <div className={styles.podiumInfo}>
                      <span className={styles.podiumName}>{top3[1].name}</span>
                      {rankSubtitle(top3[1], isArtist) && (
                        <span className={styles.podiumSubtitle}>{rankSubtitle(top3[1], isArtist)}</span>
                      )}
                    </div>
                  </div>
                )}

                {top3.length >= 1 && (
                  <div className={`${styles.podiumItem} ${styles.podiumCenter}`}>
                    <span className={styles.podiumCrown}>👑</span>
                    <div className={`${styles.podiumImageWrap} ${styles.podiumImageLarge}`}>
                      <Image
                        src={top3[0].image}
                        alt={top3[0].name}
                        fill
                        sizes="72px"
                        className={styles.podiumImage}
                        unoptimized
                      />
                    </div>
                    <span className={`${styles.podiumBadge} ${styles.rankGold}`}>1</span>
                    <div className={styles.podiumInfo}>
                      <span className={styles.podiumName}>{top3[0].name}</span>
                      {rankSubtitle(top3[0], isArtist) && (
                        <span className={styles.podiumSubtitle}>{rankSubtitle(top3[0], isArtist)}</span>
                      )}
                    </div>
                  </div>
                )}

                {top3.length >= 3 && (
                  <div className={`${styles.podiumItem} ${styles.podiumRight}`}>
                    <div className={styles.podiumImageWrap}>
                      <Image
                        src={top3[2].image}
                        alt={top3[2].name}
                        fill
                        sizes="56px"
                        className={styles.podiumImage}
                        unoptimized
                      />
                    </div>
                    <span className={`${styles.podiumBadge} ${styles.rankBronze}`}>3</span>
                    <div className={styles.podiumInfo}>
                      <span className={styles.podiumName}>{top3[2].name}</span>
                      {rankSubtitle(top3[2], isArtist) && (
                        <span className={styles.podiumSubtitle}>{rankSubtitle(top3[2], isArtist)}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {rest.length > 0 && (
            <ol className={styles.rankList}>
              {rest.map((item, idx) => renderListItem(item, idx + 3))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}

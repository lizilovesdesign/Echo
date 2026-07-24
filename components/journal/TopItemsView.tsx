'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { MusicNote01Icon } from 'hugeicons-react';
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

const TOP_3_QUIPS: Record<TabKey, string[]> = {
  artists: ['Your absolute favorite', 'A close second', 'Rounding out the top three'],
  tracks: ['Your #1 earworm', 'You keep coming back to this one', 'A solid third place'],
  albums: ['The album you had on repeat', 'Nearly took the crown', 'Top three complete'],
};

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

function PodiumItem({ item, rank, isArtist, delay }: { item: TopItem; rank: number; isArtist: boolean; delay: number }) {
  const isFirst = rank === 0;
  return (
    <div
      className={`${styles.podiumItem} ${isFirst ? styles.podiumFirst : rank === 1 ? styles.podiumSecond : styles.podiumThird}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={styles.podiumMedal}>{RANK_MEDALS[rank]}</div>
      <div className={`${styles.podiumImageWrap} ${isArtist ? styles.circleImage : styles.squareImage}`}>
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes={isFirst ? '120px' : '96px'}
          className={styles.podiumImage}
          unoptimized
        />
      </div>
      <span className={styles.podiumName}>{item.name}</span>
      {item.artist && <span className={styles.podiumArtist}>{item.artist}</span>}
      {item.genres && item.genres.length > 0 && (
        <span className={styles.podiumGenre}>{item.genres[0]}</span>
      )}
    </div>
  );
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
      <div className={styles.connectCard}>
        <div className={styles.connectEmoji}>🎶</div>
        <p className={styles.connectTitle}>Connect Spotify first</p>
        <p className={styles.connectDesc}>Link your account to discover your listening personality.</p>
        <a href="/api/auth/spotify/link" className={styles.connectBtn}>Connect Spotify</a>
      </div>
    );
  }

  if (needsReauth) {
    return (
      <div className={styles.connectCard}>
        <div className={styles.connectEmoji}>🔄</div>
        <p className={styles.connectTitle}>Permissions needed</p>
        <p className={styles.connectDesc}>Reconnect Spotify to unlock your top items.</p>
        <a href="/api/auth/spotify/link" className={styles.connectBtn}>Reconnect</a>
      </div>
    );
  }

  const podiumItems = items.slice(0, 3);
  const restItems = items.slice(3);
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
        <div className={styles.podiumSkeleton}>
          <div className={styles.skelSmall}>
            <div className={styles.skelCircle} />
            <div className={styles.skelBar} />
          </div>
          <div className={styles.skelLarge}>
            <div className={styles.skelCircleLg} />
            <div className={styles.skelBar} />
          </div>
          <div className={styles.skelSmall}>
            <div className={styles.skelCircle} />
            <div className={styles.skelBar} />
          </div>
        </div>
      ) : hasError ? (
        <div className={styles.error}>Something went wrong. Give it another shot.</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>Nothing here yet. Keep listening!</div>
      ) : (
        <>
          {podiumItems.length > 0 && (
            <div className={styles.podium} role="tabpanel">
              {podiumItems[0] && (
                <PodiumItem item={podiumItems[0]} rank={0} isArtist={isArtist} delay={0} />
              )}
              <div className={styles.podiumSide}>
                {podiumItems[1] && (
                  <PodiumItem item={podiumItems[1]} rank={1} isArtist={isArtist} delay={100} />
                )}
                {podiumItems[2] && (
                  <PodiumItem item={podiumItems[2]} rank={2} isArtist={isArtist} delay={200} />
                )}
              </div>
            </div>
          )}

          {restItems.length > 0 && (
            <div className={styles.list}>
              {restItems.map((item, i) => (
                <div
                  key={item.id}
                  className={styles.row}
                  style={{ animationDelay: `${(i + 3) * 50}ms` }}
                >
                  <span className={styles.rank}>{i + 4}</span>
                  <div className={`${styles.imageWrap} ${isArtist ? styles.circleImage : styles.squareImage}`}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className={styles.rowImage}
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
        </>
      )}
    </div>
  );
}

import React from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tokens } from '../lib/theme/tokens';
import { TouchableButton } from '../components/ui/TouchableButton';

type MoodTag = 'Nostalgic' | 'Energetic' | 'Melancholic' | 'Calm';

interface EchoEntry {
  id: string;
  songTitle: string;
  artist: string;
  albumArtUrl: string;
  moodTag: MoodTag;
  note: string;
  createdAt: string;
}

const moodEmojis: Record<MoodTag, string> = {
  Nostalgic: '🍂',
  Energetic: '⚡',
  Melancholic: '🌧️',
  Calm: '🌊',
};

interface TimelineScreenProps {
  onCreateClick: () => void;
  onLogout: () => void;
}

export function TimelineScreen({ onCreateClick, onLogout }: TimelineScreenProps) {
  const colorScheme = useColorScheme();
  const activeTheme = colorScheme === 'dark' ? 'dark' : 'light';
  const themeColors = tokens.colors[activeTheme];
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading, refetch } = useQuery<EchoEntry[]>({
    queryKey: ['mobileEchoes'],
    queryFn: async () => {
      // In production, fetch from server API.
      // E.g. fetch(`${api_url}/api/echoes`, { headers: { Authorization: `Bearer ${token}` } })
      // For local scaffolding, return default mock list.
      return [
        {
          id: '1',
          songTitle: 'Rose Quartz',
          artist: 'Toro y Moi',
          albumArtUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop',
          moodTag: 'Calm',
          note: 'Sunset vibes driving home from work.',
          createdAt: new Date().toISOString(),
        },
      ];
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { borderBottomColor: themeColors.outlineVariant }]}>
        <Text style={[styles.headerTitle, { color: themeColors.onBackground }]}>Archive</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={{ color: themeColors.primary, fontWeight: '500' }}>Logout</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyEmoji, { color: themeColors.onSurfaceVariant }]}>🎵</Text>
          <Text style={[styles.emptyTitle, { color: themeColors.onSurface }]}>Your timeline is silent</Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.onSurfaceVariant }]}>
            Anchor your first song to a personal memory and mood in under 20 seconds.
          </Text>
          <TouchableButton onPress={onCreateClick} themeColors={themeColors} style={styles.emptyBtn}>
            Create an Echo
          </TouchableButton>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: themeColors.surface, borderColor: themeColors.outlineVariant },
              ]}
            >
              <View style={styles.cardHeader}>
                <Image source={{ uri: item.albumArtUrl }} style={styles.cardArt} />
                <View style={styles.cardMeta}>
                  <Text style={[styles.cardTitle, { color: themeColors.onSurface }]} numberOfLines={1}>
                    {item.songTitle}
                  </Text>
                  <Text style={[styles.cardArtist, { color: themeColors.onSurfaceVariant }]} numberOfLines={1}>
                    {item.artist}
                  </Text>
                </View>
              </View>

              <View style={styles.cardTags}>
                <View style={[styles.tag, { backgroundColor: themeColors.primaryContainer }]}>
                  <Text style={{ fontSize: 12, marginRight: 2 }}>{moodEmojis[item.moodTag]}</Text>
                  <Text style={[styles.tagText, { color: themeColors.onPrimaryContainer }]}>{item.moodTag}</Text>
                </View>
                <Text style={[styles.timestamp, { color: themeColors.onSurfaceVariant }]}>Just now</Text>
              </View>

              {item.note ? (
                <Text style={[styles.note, { color: themeColors.onSurface, backgroundColor: themeColors.surfaceVariant }]}>
                  {item.note}
                </Text>
              ) : null}
            </View>
          )}
        />
      )}

      {entries.length > 0 && (
        <TouchableOpacity
          onPress={onCreateClick}
          style={[styles.fab, { backgroundColor: themeColors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.fabText, { color: themeColors.onPrimary }]}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: 48,
    paddingBottom: tokens.spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutBtn: {
    padding: tokens.spacing.sm,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: tokens.spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: tokens.spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: tokens.spacing.xl,
  },
  emptyBtn: {
    width: '80%',
  },
  listContainer: {
    padding: tokens.spacing.lg,
    gap: tokens.spacing.lg,
  },
  card: {
    borderRadius: tokens.radius.container,
    borderWidth: 1,
    padding: tokens.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  cardArt: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.small,
    marginRight: tokens.spacing.md,
  },
  cardMeta: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardArtist: {
    fontSize: 12,
    marginTop: 2,
  },
  cardTags: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.small,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
  },
  note: {
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.small,
    fontSize: 14,
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: '300',
  },
});

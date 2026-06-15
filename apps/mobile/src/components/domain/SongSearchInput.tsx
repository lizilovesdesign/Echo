import React from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { tokens, ThemeColors } from '../../lib/theme/tokens';

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumArtUrl: string;
}

interface SongSearchInputProps {
  query: string;
  onChangeQuery: (q: string) => void;
  tracks: SpotifyTrack[];
  onSelectTrack: (track: SpotifyTrack) => void;
  isLoading: boolean;
  themeColors: ThemeColors;
}

export function SongSearchInput({
  query,
  onChangeQuery,
  tracks,
  onSelectTrack,
  isLoading,
  themeColors,
}: SongSearchInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: themeColors.surfaceVariant,
            color: themeColors.onSurface,
            borderColor: themeColors.outlineVariant,
          },
        ]}
        value={query}
        onChangeText={onChangeQuery}
        placeholder="I'm listening to..."
        placeholderTextColor={themeColors.onSurfaceVariant}
        autoCapitalize="none"
      />

      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={themeColors.primary} />
        </View>
      )}

      {tracks.length > 0 && (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          style={[styles.list, { borderColor: themeColors.outlineVariant }]}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelectTrack(item)}
              style={[styles.row, { borderBottomColor: themeColors.outlineVariant }]}
              activeOpacity={0.7}
            >
              <Image source={{ uri: item.albumArtUrl }} style={styles.albumArt} />
              <View style={styles.meta}>
                <Text style={[styles.trackName, { color: themeColors.onSurface }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.artistName, { color: themeColors.onSurfaceVariant }]} numberOfLines={1}>
                  {item.artist}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: tokens.spacing.md,
  },
  input: {
    minHeight: 48,
    borderRadius: tokens.radius.interactive,
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.lg,
    fontSize: 16,
  },
  loader: {
    padding: tokens.spacing.sm,
    alignItems: 'center',
  },
  list: {
    borderWidth: 1,
    borderRadius: tokens.radius.container,
    marginTop: tokens.spacing.sm,
    maxHeight: 250,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.md,
    borderBottomWidth: 1,
    minHeight: 48, // Touch target height > 44px
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.small,
    marginRight: tokens.spacing.md,
  },
  meta: {
    flex: 1,
  },
  trackName: {
    fontSize: 14,
    fontWeight: '500',
  },
  artistName: {
    fontSize: 12,
    marginTop: 2,
  },
});

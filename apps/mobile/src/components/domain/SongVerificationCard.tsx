import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { tokens, ThemeColors } from '../../lib/theme/tokens';
import { TouchableButton } from '../ui/TouchableButton';
import { SpotifyTrack } from './SongSearchInput';

interface SongVerificationCardProps {
  track: SpotifyTrack;
  onConfirm: () => void;
  onCancel: () => void;
  themeColors: ThemeColors;
}

export function SongVerificationCard({
  track,
  onConfirm,
  onCancel,
  themeColors,
}: SongVerificationCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.outlineVariant }]}>
      <Image source={{ uri: track.albumArtUrl }} style={styles.albumArt} />
      <View style={styles.info}>
        <Text style={[styles.trackName, { color: themeColors.onSurface }]} numberOfLines={1}>
          {track.name}
        </Text>
        <Text style={[styles.artistName, { color: themeColors.onSurfaceVariant }]} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableButton
          onPress={onCancel}
          variant="secondary"
          themeColors={themeColors}
          style={styles.btn}
        >
          Again
        </TouchableButton>
        <TouchableButton
          onPress={onConfirm}
          variant="primary"
          themeColors={themeColors}
          style={styles.btn}
        >
          Use Song
        </TouchableButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: tokens.spacing.xl,
    borderRadius: tokens.radius.container,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  albumArt: {
    width: 200,
    height: 200,
    borderRadius: tokens.radius.container,
    marginBottom: tokens.spacing.lg,
  },
  info: {
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  trackName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  artistName: {
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    width: '100%',
  },
  btn: {
    flex: 1,
  },
});

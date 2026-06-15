import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { tokens, ThemeColors } from '../../lib/theme/tokens';
import { TouchableButton } from '../ui/TouchableButton';

type MoodTag = 'Nostalgic' | 'Energetic' | 'Melancholic' | 'Calm';
const moods: MoodTag[] = ['Calm', 'Melancholic', 'Nostalgic', 'Energetic'];
const moodEmojis: Record<MoodTag, string> = {
  Nostalgic: '🍂',
  Energetic: '⚡',
  Melancholic: '🌧️',
  Calm: '🌊',
};

interface EchoEntryFormProps {
  selectedMood: MoodTag | null;
  onChangeMood: (mood: MoodTag) => void;
  note: string;
  onChangeNote: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  themeColors: ThemeColors;
}

export function EchoEntryForm({
  selectedMood,
  onChangeMood,
  note,
  onChangeNote,
  onSubmit,
  onCancel,
  loading,
  themeColors,
}: EchoEntryFormProps) {
  return (
    <View style={styles.form}>
      <Text style={[styles.label, { color: themeColors.onSurface }]}>How does this song make you feel?</Text>
      
      <View style={styles.moodGrid}>
        {moods.map((mood) => {
          const isSelected = selectedMood === mood;
          return (
            <TouchableOpacity
              key={mood}
              onPress={() => onChangeMood(mood)}
              activeOpacity={0.7}
              style={[
                styles.moodBubble,
                isSelected
                  ? { backgroundColor: themeColors.primaryContainer, borderColor: themeColors.primary }
                  : { backgroundColor: themeColors.surface, borderColor: themeColors.outlineVariant },
              ]}
            >
              <Text style={styles.emoji}>{moodEmojis[mood]}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  { color: isSelected ? themeColors.onPrimaryContainer : themeColors.onSurfaceVariant },
                ]}
              >
                {mood}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.inputWrapper}>
        <Text style={[styles.label, { color: themeColors.onSurface }]}>Write a memory or reflection (optional)</Text>
        <TextInput
          style={[
            styles.textarea,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.outlineVariant,
              color: themeColors.onSurface,
            },
          ]}
          value={note}
          onChangeText={(text) => onChangeNote(text.slice(0, 500))} // Strictly enforce length limit
          maxLength={500}
          multiline
          numberOfLines={4}
          placeholder="What memories does this song bring up?"
          placeholderTextColor={themeColors.onSurfaceVariant}
        />
        <Text style={[styles.counter, { color: themeColors.onSurfaceVariant }]}>
          {note.length} / 500
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableButton
          onPress={onCancel}
          variant="secondary"
          disabled={loading}
          themeColors={themeColors}
          style={styles.btn}
        >
          Cancel
        </TouchableButton>
        <TouchableButton
          onPress={onSubmit}
          variant="primary"
          disabled={loading || !selectedMood}
          loading={loading}
          themeColors={themeColors}
          style={styles.btn}
        >
          Save Echo
        </TouchableButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    gap: tokens.spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  moodBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.xs,
    minHeight: 44, // Touch target height > 44px
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radius.small,
    borderWidth: 1,
    flex: 1,
    minWidth: '45%',
  },
  emoji: {
    fontSize: 16,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapper: {
    width: '100%',
  },
  textarea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: tokens.radius.interactive,
    padding: tokens.spacing.md,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  counter: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: tokens.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    width: '100%',
    marginTop: tokens.spacing.md,
  },
  btn: {
    flex: 1,
  },
});

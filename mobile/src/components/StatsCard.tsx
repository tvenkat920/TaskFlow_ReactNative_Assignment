import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface StatsCardProps {
  label: string;
  value: number;
  accentColor: string;
  iconName?: string;
  onPress?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  accentColor,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={[styles.card, { borderTopColor: accentColor, borderTopWidth: 3 }]}
    >
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.indicator, { backgroundColor: accentColor }]} />
      </View>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});

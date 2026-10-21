import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.textRow}>
        <Text style={styles.title}>Productivity Progress</Text>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.subtitle}>
        {completed} of {total} tasks completed
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    marginBottom: spacing.lg,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  track: {
    height: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

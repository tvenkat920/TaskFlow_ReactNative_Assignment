import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { TaskPriority } from '../types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'sm', style }) => {
  const color = colors.priority[priority] || colors.primary;

  return (
    <View style={[styles.priorityBadge, { borderColor: color, backgroundColor: `${color}15` }, style]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.priorityText, { color }, size === 'sm' && styles.textSm]}>
        {priority}
      </Text>
    </View>
  );
};

interface CategoryBadgeProps {
  category: string;
  style?: ViewStyle;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, style }) => {
  return (
    <View style={[styles.categoryBadge, style]}>
      <Text style={styles.categoryText}>#{category}</Text>
    </View>
  );
};

interface StatusBadgeProps {
  isCompleted: boolean;
  isOverdue?: boolean;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isCompleted, isOverdue = false, style }) => {
  if (isCompleted) {
    return (
      <View style={[styles.statusBadge, { backgroundColor: colors.successLight, borderColor: colors.success }, style]}>
        <Text style={[styles.statusText, { color: colors.success }]}>Completed</Text>
      </View>
    );
  }

  if (isOverdue) {
    return (
      <View style={[styles.statusBadge, { backgroundColor: colors.dangerLight, borderColor: colors.danger }, style]}>
        <Text style={[styles.statusText, { color: colors.danger }]}>Overdue</Text>
      </View>
    );
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: '#3B82F6' }, style]}>
      <Text style={[styles.statusText, { color: '#60A5FA' }]}>Pending</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  priorityText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  textSm: {
    fontSize: 10,
  },
  categoryBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    alignSelf: 'flex-start',
  },
  categoryText: {
    ...typography.caption,
    color: colors.accentLight,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
});

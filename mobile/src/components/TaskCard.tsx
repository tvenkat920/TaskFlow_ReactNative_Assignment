import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Task } from '../types';
import { PriorityBadge, CategoryBadge } from './Badge';
import { formatDate, isTaskOverdue } from '../utils/date';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onToggleComplete }) => {
  const overdue = isTaskOverdue(task);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.card,
        task.isCompleted && styles.completedCard,
        overdue && styles.overdueCard,
      ]}
    >
      <View style={styles.cardHeader}>
        {/* Checkbox */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={onToggleComplete}
          style={[styles.checkbox, task.isCompleted && styles.checkboxCompleted]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        {/* Title and description */}
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, task.isCompleted && styles.completedTitle]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {task.description ? (
            <Text
              style={[styles.description, task.isCompleted && styles.completedDescription]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Footer with badges and deadline */}
      <View style={styles.cardFooter}>
        <View style={styles.badgeRow}>
          <PriorityBadge priority={task.priority} size="sm" />
          <CategoryBadge category={task.category} style={styles.categoryMargin} />
        </View>

        <View style={styles.deadlineContainer}>
          {overdue && <Text style={styles.overdueAlert}>⚠️ Overdue: </Text>}
          <Text style={[styles.deadlineText, overdue && styles.overdueText]}>
            {task.dueAt ? formatDate(task.dueAt) : 'No deadline'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completedCard: {
    opacity: 0.65,
    backgroundColor: '#0F1626',
    borderColor: '#1A2333',
  },
  overdueCard: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 14,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  completedDescription: {
    color: colors.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryMargin: {
    marginLeft: spacing.xs + 2,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overdueAlert: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '700',
    fontSize: 11,
  },
  deadlineText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  overdueText: {
    color: colors.danger,
    fontWeight: '600',
  },
});

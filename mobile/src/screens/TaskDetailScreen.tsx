import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Header } from '../components/Header';
import { PriorityBadge, CategoryBadge, StatusBadge } from '../components/Badge';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { useTasks } from '../context/TaskContext';
import { RootStackParamList } from '../types';
import { formatDateTime, isTaskOverdue } from '../utils/date';

export const TaskDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { tasks, toggleComplete, deleteTask } = useTasks();

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  const taskId = route.params?.taskId;
  const task = tasks.find((t) => t._id === taskId);

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Task Not Found" onBack={() => navigation.goBack()} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>This task no longer exists or was deleted.</Text>
          <Button title="Back to Tasks" onPress={() => navigation.goBack()} style={styles.backBtn} />
        </View>
      </SafeAreaView>
    );
  }

  const overdue = isTaskOverdue(task);

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      await toggleComplete(task._id);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update task.');
    } finally {
      setIsToggling(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteTask(task._id);
      setShowDeleteModal(false);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Task Details"
        onBack={() => navigation.goBack()}
        rightAction={
          <Button
            title="Edit"
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate('AddEditTask', { taskId: task._id, initialData: task })}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Overdue Alert Banner */}
        {overdue && (
          <View style={styles.overdueBanner}>
            <Text style={styles.overdueIcon}>⚠️</Text>
            <Text style={styles.overdueText}>
              This task has passed its deadline and is currently overdue!
            </Text>
          </View>
        )}

        {/* Task Title & Badges */}
        <View style={styles.cardSection}>
          <View style={styles.badgeRow}>
            <StatusBadge isCompleted={task.isCompleted} isOverdue={overdue} />
            <PriorityBadge priority={task.priority} size="md" style={styles.badgeMargin} />
            <CategoryBadge category={task.category} style={styles.badgeMargin} />
          </View>

          <Text style={[styles.title, task.isCompleted && styles.completedTitle]}>
            {task.title}
          </Text>

          {task.description ? (
            <Text style={styles.description}>{task.description}</Text>
          ) : (
            <Text style={styles.emptyDesc}>No description provided for this task.</Text>
          )}
        </View>

        {/* Schedule & Deadline Information */}
        <View style={styles.metaSection}>
          <Text style={styles.metaSectionTitle}>Schedule & Deadlines</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Scheduled Date:</Text>
            <Text style={styles.metaValue}>{formatDateTime(task.scheduledAt)}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Due Deadline:</Text>
            <Text style={[styles.metaValue, overdue && styles.overdueValue]}>
              {formatDateTime(task.dueAt)}
            </Text>
          </View>

          {task.completedAt && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Completed On:</Text>
              <Text style={[styles.metaValue, { color: colors.success }]}>
                {formatDateTime(task.completedAt)}
              </Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created At:</Text>
            <Text style={styles.metaValueMuted}>{formatDateTime(task.createdAt)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button
            title={task.isCompleted ? '↩ Reopen Task' : '✓ Mark as Completed'}
            variant={task.isCompleted ? 'secondary' : 'primary'}
            size="lg"
            loading={isToggling}
            onPress={handleToggle}
            style={styles.actionBtn}
          />

          <Button
            title="🗑 Delete Task"
            variant="danger"
            size="lg"
            onPress={() => setShowDeleteModal(true)}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
  },
  notFoundContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  backBtn: {
    minWidth: 160,
  },
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  overdueIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  overdueText: {
    ...typography.bodyBold,
    color: colors.danger,
    flex: 1,
    fontSize: 13,
  },
  cardSection: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    marginBottom: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  badgeMargin: {
    marginLeft: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  emptyDesc: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  metaSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  metaSectionTitle: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  metaValueMuted: {
    ...typography.caption,
    color: colors.textMuted,
  },
  overdueValue: {
    color: colors.danger,
    fontWeight: '700',
  },
  actionsSection: {
    marginTop: spacing.md,
  },
  actionBtn: {
    marginBottom: spacing.md,
  },
});

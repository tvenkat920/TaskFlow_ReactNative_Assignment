import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { ProgressBar } from '../components/ProgressBar';
import { StatsCard } from '../components/StatsCard';
import { TaskCard } from '../components/TaskCard';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { RootStackParamList } from '../types';
import { getGreeting, isDateToday } from '../utils/date';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { tasks, stats, isRefreshing, refreshTasks, toggleComplete, setStatusFilter } = useTasks();

  const greeting = getGreeting();
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Filter tasks due today
  const todayTasks = tasks.filter((t) => !t.isCompleted && isDateToday(t.dueAt));

  // Filter upcoming tasks
  const now = new Date();
  const upcomingTasks = tasks
    .filter((t) => {
      if (t.isCompleted || !t.dueAt) return false;
      const d = new Date(t.dueAt);
      return d > now && !isDateToday(t.dueAt);
    })
    .slice(0, 3);

  const handleStatsCardPress = (filter: 'all' | 'completed' | 'pending' | 'overdue') => {
    setStatusFilter(filter);
    navigation.navigate('Main' as any, { screen: 'Tasks' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshTasks}
            tintColor={colors.primaryLight}
            colors={[colors.primaryLight, colors.accent]}
          />
        }
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateText}>{todayFormatted}</Text>
            <Text style={styles.greetingText}>
              {greeting}, {user?.name?.split(' ')[0] || 'User'}! 👋
            </Text>
          </View>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => navigation.navigate('Main' as any, { screen: 'Profile' })}
          >
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Productivity Progress Bar */}
        <ProgressBar completed={stats.completed} total={stats.total} />

        {/* 4 Summary Stats Cards */}
        <View style={styles.statsGrid}>
          <StatsCard
            label="Total"
            value={stats.total}
            accentColor={colors.primaryLight}
            onPress={() => handleStatsCardPress('all')}
          />
          <StatsCard
            label="Completed"
            value={stats.completed}
            accentColor={colors.success}
            onPress={() => handleStatsCardPress('completed')}
          />
          <StatsCard
            label="Pending"
            value={stats.pending}
            accentColor={colors.accent}
            onPress={() => handleStatsCardPress('pending')}
          />
          <StatsCard
            label="Overdue"
            value={stats.overdue}
            accentColor={colors.danger}
            onPress={() => handleStatsCardPress('overdue')}
          />
        </View>

        {/* Tasks Due Today Section */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Due Today</Text>
            <Text style={styles.sectionSubtitle}>
              {todayTasks.length} {todayTasks.length === 1 ? 'task' : 'tasks'} scheduled for today
            </Text>
          </View>
          {todayTasks.length > 0 && (
            <TouchableOpacity onPress={() => handleStatsCardPress('all')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {todayTasks.length > 0 ? (
          todayTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task._id })}
              onToggleComplete={() => toggleComplete(task._id)}
            />
          ))
        ) : (
          <View style={styles.todayEmptyCard}>
            <Text style={styles.todayEmptyIcon}>✨</Text>
            <Text style={styles.todayEmptyText}>No urgent tasks due today. You are all caught up!</Text>
          </View>
        )}

        {/* Upcoming Deadlines Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: spacing.xl }]}>
          <View>
            <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
            <Text style={styles.sectionSubtitle}>Tasks coming up next</Text>
          </View>
        </View>

        {upcomingTasks.length > 0 ? (
          upcomingTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task._id })}
              onToggleComplete={() => toggleComplete(task._id)}
            />
          ))
        ) : (
          <EmptyState
            icon="📅"
            title="No Upcoming Deadlines"
            description="Create a task with a deadline to stay on track."
            actionTitle="Add New Task"
            onAction={() => navigation.navigate('AddEditTask', {})}
          />
        )}
      </ScrollView>

      {/* Quick Add Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddEditTask', {})}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dateText: {
    ...typography.caption,
    color: colors.accent,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  greetingText: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: 2,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.bodyBold,
    color: colors.primaryLight,
    fontSize: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seeAllText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  todayEmptyCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  todayEmptyIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  todayEmptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '300',
  },
});

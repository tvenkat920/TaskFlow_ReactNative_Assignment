import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { RootStackParamList, TaskStatusFilter, TaskPriority, TaskSortOption, Task } from '../types';

const statusTabs: { label: string; value: TaskStatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
  { label: 'Overdue', value: 'overdue' },
];

const sortOptions: { label: string; value: TaskSortOption }[] = [
  { label: '⚡ Smart Rank', value: 'rank' },
  { label: '📅 Deadline (Earliest)', value: 'dueAt_asc' },
  { label: '🔥 Priority (Highest)', value: 'priority_desc' },
  { label: '✨ Newest Created', value: 'createdAt_desc' },
];

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    tasks,
    isLoading,
    isRefreshing,
    refreshTasks,
    toggleComplete,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter,
    sortOption,
    setSortOption,
    categories,
  } = useTasks();

  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false);

  const priorities: (TaskPriority | undefined)[] = [undefined, 'Urgent', 'High', 'Medium', 'Low'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>All Tasks</Text>
          <Text style={styles.taskCountText}>
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </Text>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, description, or tag..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter Tab Pills */}
        <View style={styles.tabScrollContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
            {statusTabs.map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <TouchableOpacity
                  key={tab.value}
                  activeOpacity={0.7}
                  onPress={() => setStatusFilter(tab.value)}
                  style={[styles.statusTab, active && styles.statusTabActive]}
                >
                  <Text style={[styles.statusTabText, active && styles.statusTabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Category & Sorting Secondary Bar */}
        <View style={styles.secondaryFilterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => {
              const isSelected = categoryFilter === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategoryFilter(cat)}
                  style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                    #{cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sort Dropdown Toggle Button */}
          <TouchableOpacity
            style={styles.sortToggleBtn}
            onPress={() => setShowFiltersModal((prev) => !prev)}
          >
            <Text style={styles.sortToggleText}>⚙ Sort / Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Expanded Sorting Drawer */}
        {showFiltersModal && (
          <View style={styles.sortDrawer}>
            <Text style={styles.drawerLabel}>Sorting Order</Text>
            <View style={styles.sortRow}>
              {sortOptions.map((opt) => {
                const isSelected = sortOption === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setSortOption(opt.value)}
                    style={[styles.sortChip, isSelected && styles.sortChipActive]}
                  >
                    <Text style={[styles.sortChipText, isSelected && styles.sortChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.drawerLabel, { marginTop: spacing.md }]}>Filter by Priority</Text>
            <View style={styles.priorityFilterRow}>
              {priorities.map((p) => {
                const isSelected = priorityFilter === p;
                return (
                  <TouchableOpacity
                    key={p || 'All'}
                    onPress={() => setPriorityFilter(p)}
                    style={[
                      styles.priorityFilterChip,
                      isSelected && styles.priorityFilterChipActive,
                      p ? { borderColor: colors.priority[p] } : {},
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityFilterText,
                        isSelected && styles.priorityFilterTextActive,
                      ]}
                    >
                      {p || 'All'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Task List */}
        {isLoading && tasks.length === 0 ? (
          <LoadingIndicator message="Fetching tasks..." />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item: Task) => item._id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={() => navigation.navigate('TaskDetail', { taskId: item._id })}
                onToggleComplete={() => toggleComplete(item._id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refreshTasks}
                tintColor={colors.primaryLight}
                colors={[colors.primaryLight, colors.accent]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="📝"
                title={searchQuery ? 'No matching tasks' : 'No tasks found'}
                description={
                  searchQuery
                    ? 'Try searching for something else or clearing your filters.'
                    : 'Start organizing your day by creating your first task.'
                }
                actionTitle="Add New Task"
                onAction={() => navigation.navigate('AddEditTask', {})}
              />
            }
          />
        )}

        {/* Floating Quick Add Button */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AddEditTask', {})}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  taskCountText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.textPrimary,
    fontSize: 14,
  },
  clearSearchBtn: {
    padding: spacing.xs,
  },
  clearSearchText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  tabScrollContainer: {
    marginBottom: spacing.xs,
  },
  tabScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  statusTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
  },
  statusTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  statusTabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  categoryScroll: {
    flex: 1,
  },
  categoryChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs + 2,
  },
  categoryChipActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  categoryChipTextActive: {
    color: colors.accentLight,
    fontWeight: '700',
  },
  sortToggleBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    marginLeft: spacing.sm,
  },
  sortToggleText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    fontSize: 11,
  },
  sortDrawer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
  },
  drawerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sortChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  sortChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sortChipTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  priorityFilterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  priorityFilterChip: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityFilterChipActive: {
    backgroundColor: colors.surfaceHover,
  },
  priorityFilterText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priorityFilterTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 90,
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

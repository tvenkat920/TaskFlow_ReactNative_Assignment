import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Task, TaskPriority, TaskStats, TaskStatusFilter, TaskSortOption } from '../types';
import { apiClient } from '../services/apiClient';
import { useAuth } from './AuthContext';
import { compareTasks } from '../utils/sorting';

interface TaskContextType {
  tasks: Task[];
  stats: TaskStats;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: TaskStatusFilter;
  categoryFilter: string;
  priorityFilter?: TaskPriority;
  sortOption: TaskSortOption;
  categories: string[];
  fetchTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  createTask: (data: {
    title: string;
    description?: string;
    scheduledAt?: string | null;
    dueAt?: string | null;
    priority?: TaskPriority;
    category?: string;
  }) => Promise<Task>;
  updateTask: (
    id: string,
    data: {
      title?: string;
      description?: string;
      scheduledAt?: string | null;
      dueAt?: string | null;
      priority?: TaskPriority;
      category?: string;
      isCompleted?: boolean;
    }
  ) => Promise<Task>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setStatusFilter: (f: TaskStatusFilter) => void;
  setCategoryFilter: (c: string) => void;
  setPriorityFilter: (p?: TaskPriority) => void;
  setSortOption: (s: TaskSortOption) => void;
  clearError: () => void;
}

const defaultStats: TaskStats = { total: 0, completed: 0, pending: 0, overdue: 0 };

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>(defaultStats);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>(undefined);
  const [sortOption, setSortOption] = useState<TaskSortOption>('rank');

  // Derive unique categories from user's tasks
  const categories = React.useMemo(() => {
    const defaultCats = ['All', 'General', 'Work', 'Personal', 'Urgent', 'Study', 'Health', 'Finance'];
    const customCats = tasks.map((t) => t.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...customCats]));
  }, [tasks]);

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.tasks.getAll({
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        sort: sortOption,
      });
      setTasks(res.tasks);
      setStats(res.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, searchQuery, statusFilter, categoryFilter, priorityFilter, sortOption]);

  const refreshTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsRefreshing(true);
      const res = await apiClient.tasks.getAll({
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        sort: sortOption,
      });
      setTasks(res.tasks);
      setStats(res.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh tasks.');
    } finally {
      setIsRefreshing(false);
    }
  }, [isAuthenticated, searchQuery, statusFilter, categoryFilter, priorityFilter, sortOption]);

  // Refetch when filters or auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      setTasks([]);
      setStats(defaultStats);
    }
  }, [isAuthenticated, statusFilter, categoryFilter, priorityFilter, sortOption]);

  // Debounced search query
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      fetchTasks();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const createTask = async (data: any): Promise<Task> => {
    try {
      setError(null);
      const newTask = await apiClient.tasks.create(data);
      // Prepend or rank
      setTasks((prev) => [newTask, ...prev].sort(compareTasks));
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1,
      }));
      return newTask;
    } catch (err: any) {
      setError(err.message || 'Failed to create task.');
      throw err;
    }
  };

  const updateTask = async (id: string, data: any): Promise<Task> => {
    try {
      setError(null);
      const updated = await apiClient.tasks.update(id, data);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)).sort(compareTasks));
      // Refresh stats
      refreshTasks();
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update task.');
      throw err;
    }
  };

  const toggleComplete = async (id: string) => {
    // Optimistic update
    const previousTasks = [...tasks];
    const target = tasks.find((t) => t._id === id);
    if (!target) return;

    const willBeCompleted = !target.isCompleted;
    setTasks((prev) =>
      prev
        .map((t) =>
          t._id === id
            ? {
                ...t,
                isCompleted: willBeCompleted,
                completedAt: willBeCompleted ? new Date().toISOString() : null,
              }
            : t
        )
        .sort(compareTasks)
    );

    setStats((prev) => ({
      ...prev,
      completed: willBeCompleted ? prev.completed + 1 : prev.completed - 1,
      pending: willBeCompleted ? prev.pending - 1 : prev.pending + 1,
    }));

    try {
      await apiClient.tasks.toggleComplete(id);
    } catch (err: any) {
      // Rollback on failure
      setTasks(previousTasks);
      setError(err.message || 'Failed to toggle task completion.');
    }
  };

  const deleteTask = async (id: string) => {
    const previousTasks = [...tasks];
    const target = tasks.find((t) => t._id === id);

    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t._id !== id));
    if (target) {
      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        completed: target.isCompleted ? Math.max(0, prev.completed - 1) : prev.completed,
        pending: !target.isCompleted ? Math.max(0, prev.pending - 1) : prev.pending,
      }));
    }

    try {
      await apiClient.tasks.delete(id);
    } catch (err: any) {
      // Rollback
      setTasks(previousTasks);
      setError(err.message || 'Failed to delete task.');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        isLoading,
        isRefreshing,
        error,
        searchQuery,
        statusFilter,
        categoryFilter,
        priorityFilter,
        sortOption,
        categories,
        fetchTasks,
        refreshTasks,
        createTask,
        updateTask,
        toggleComplete,
        deleteTask,
        setSearchQuery,
        setStatusFilter,
        setCategoryFilter,
        setPriorityFilter,
        setSortOption,
        clearError,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

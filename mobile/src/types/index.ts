export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Task {
  _id: string;
  owner: string;
  title: string;
  description: string;
  scheduledAt?: string | null;
  dueAt?: string | null;
  priority: TaskPriority;
  category: string;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export type TaskStatusFilter = 'all' | 'pending' | 'completed' | 'today' | 'upcoming' | 'overdue';

export type TaskSortOption = 'rank' | 'dueAt_asc' | 'dueAt_desc' | 'priority_desc' | 'createdAt_desc';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  TaskDetail: { taskId: string };
  AddEditTask: { taskId?: string; initialData?: Partial<Task> };
};

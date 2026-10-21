import { Task, TaskPriority } from '../types';
import { isTaskOverdue } from './date';

export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

/**
 * Deterministic Task-Ranking Function (Mobile Mirror)
 * Precedence:
 * 1. Incomplete before Completed (completed sorted by completedAt desc)
 * 2. Overdue tasks first
 * 3. Earlier deadlines first (tasks without deadlines later)
 * 4. Higher priority first when deadlines are tied or absent
 * 5. Earlier scheduled time first
 * 6. Newest creation time as final tie-breaker
 */
export const compareTasks = (a: Task, b: Task): number => {
  // Rule 1: Incomplete before completed
  if (a.isCompleted !== b.isCompleted) {
    return a.isCompleted ? 1 : -1;
  }

  // Completed tasks: most recently completed first
  if (a.isCompleted && b.isCompleted) {
    const timeA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.updatedAt || 0).getTime();
    const timeB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.updatedAt || 0).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  }

  // Incomplete tasks:
  // Rule 2: Overdue first
  const aOverdue = isTaskOverdue(a);
  const bOverdue = isTaskOverdue(b);
  if (aOverdue !== bOverdue) {
    return aOverdue ? -1 : 1;
  }

  // Rule 3: Earlier deadlines first
  const hasDueA = Boolean(a.dueAt);
  const hasDueB = Boolean(b.dueAt);
  if (hasDueA && !hasDueB) return -1;
  if (!hasDueA && hasDueB) return 1;

  if (hasDueA && hasDueB) {
    const dueA = new Date(a.dueAt!).getTime();
    const dueB = new Date(b.dueAt!).getTime();
    if (dueA !== dueB) return dueA - dueB;
  }

  // Rule 4: Priority
  const weightA = PRIORITY_WEIGHTS[a.priority] || 2;
  const weightB = PRIORITY_WEIGHTS[b.priority] || 2;
  if (weightA !== weightB) {
    return weightB - weightA;
  }

  // Rule 5: Earlier scheduled time
  const hasSchedA = Boolean(a.scheduledAt);
  const hasSchedB = Boolean(b.scheduledAt);
  if (hasSchedA && !hasSchedB) return -1;
  if (!hasSchedA && hasSchedB) return 1;

  if (hasSchedA && hasSchedB) {
    const schedA = new Date(a.scheduledAt!).getTime();
    const schedB = new Date(b.scheduledAt!).getTime();
    if (schedA !== schedB) return schedA - schedB;
  }

  // Rule 6: Newest creation time
  const createA = new Date(a.createdAt || 0).getTime();
  const createB = new Date(b.createdAt || 0).getTime();
  if (createA !== createB) {
    return createB - createA;
  }

  return (a._id || '').localeCompare(b._id || '');
};

export const rankTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort(compareTasks);
};

import { ITask, TaskPriority } from '../types';

/**
 * Priority weight mapping for deterministic ranking.
 * Higher number = higher precedence.
 */
export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

/**
 * Checks whether an incomplete task has passed its due deadline.
 */
export const isTaskOverdue = (task: Pick<ITask, 'isCompleted' | 'dueAt'>, referenceDate = new Date()): boolean => {
  if (task.isCompleted || !task.dueAt) {
    return false;
  }
  return new Date(task.dueAt).getTime() < referenceDate.getTime();
};

/**
 * Deterministic Task-Ranking Function
 *
 * Implements the required precedence order:
 * 1. Incomplete tasks before completed tasks (in active views).
 *    If both are completed, sort by most recently completed first (completedAt DESC).
 * 2. Overdue tasks first (an incomplete task with a past deadline precedes non-overdue tasks).
 * 3. Earlier deadlines first (tasks with deadlines precede tasks without deadlines;
 *    between tasks with deadlines, earlier timestamp wins).
 * 4. Higher priority first when deadlines are equal or both are absent:
 *    Urgent > High > Medium > Low.
 * 5. Earlier scheduled time first when deadlines & priority are tied.
 * 6. Newest creation time as final tie-breaker (createdAt DESC).
 *
 * Handling Conflicting Deadline and Priority Signals:
 * - Deadline holds higher urgency precedence over priority because deadlines represent external temporal commitments.
 * - However, when deadlines are identical or when neither task has a deadline specified, priority dictates the ordering.
 * - Overdue tasks are placed at the absolute front because an expired commitment requires immediate attention.
 */
export const compareTasks = (a: ITask, b: ITask, referenceDate = new Date()): number => {
  // Rule 1: Incomplete before Completed
  if (a.isCompleted !== b.isCompleted) {
    return a.isCompleted ? 1 : -1;
  }

  // If both tasks are completed, sort by most recently completed first
  if (a.isCompleted && b.isCompleted) {
    const timeA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.updatedAt || 0).getTime();
    const timeB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.updatedAt || 0).getTime();
    if (timeB !== timeA) {
      return timeB - timeA; // Descending (most recent completion first)
    }
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  }

  // Both are incomplete tasks from here onwards:

  // Rule 2: Overdue tasks first
  const aOverdue = isTaskOverdue(a, referenceDate);
  const bOverdue = isTaskOverdue(b, referenceDate);
  if (aOverdue !== bOverdue) {
    return aOverdue ? -1 : 1;
  }

  // Rule 3: Earlier deadlines first; tasks without deadlines go later
  const hasDueA = Boolean(a.dueAt);
  const hasDueB = Boolean(b.dueAt);

  if (hasDueA && !hasDueB) return -1;
  if (!hasDueA && hasDueB) return 1;

  if (hasDueA && hasDueB) {
    const dueTimeA = new Date(a.dueAt!).getTime();
    const dueTimeB = new Date(b.dueAt!).getTime();
    if (dueTimeA !== dueTimeB) {
      return dueTimeA - dueTimeB; // Earlier deadline first
    }
  }

  // Rule 4: Higher priority first when deadlines are equal or both absent
  const weightA = PRIORITY_WEIGHTS[a.priority] || 2;
  const weightB = PRIORITY_WEIGHTS[b.priority] || 2;
  if (weightA !== weightB) {
    return weightB - weightA; // Higher priority (larger weight) first
  }

  // Rule 5: Earlier scheduled time first when relevant
  const hasSchedA = Boolean(a.scheduledAt);
  const hasSchedB = Boolean(b.scheduledAt);

  if (hasSchedA && !hasSchedB) return -1;
  if (!hasSchedA && hasSchedB) return 1;

  if (hasSchedA && hasSchedB) {
    const schedTimeA = new Date(a.scheduledAt!).getTime();
    const schedTimeB = new Date(b.scheduledAt!).getTime();
    if (schedTimeA !== schedTimeB) {
      return schedTimeA - schedTimeB; // Earlier scheduled time first
    }
  }

  // Rule 6: Newest creation time as final tie-breaker
  const createA = new Date(a.createdAt || 0).getTime();
  const createB = new Date(b.createdAt || 0).getTime();
  if (createA !== createB) {
    return createB - createA; // Newest creation first
  }

  // Deterministic fallback using ID string comparison
  const idA = a._id?.toString() || '';
  const idB = b._id?.toString() || '';
  return idA.localeCompare(idB);
};

/**
 * Sorts an array of tasks deterministically using the task-ranking rules.
 */
export const rankTasks = (tasks: ITask[], referenceDate = new Date()): ITask[] => {
  return [...tasks].sort((a, b) => compareTasks(a, b, referenceDate));
};

import { formatDate, formatTime, formatDateTime, isDateToday, isTaskOverdue, getGreeting } from '../utils/date';
import { rankTasks, compareTasks } from '../utils/sorting';
import { loginSchema, registerSchema } from '../validation/authSchema';
import { taskFormSchema } from '../validation/taskSchema';
import { Task } from '../types';

describe('Mobile Date Utilities', () => {
  test('formatDate returns expected string or fallback', () => {
    expect(formatDate(null)).toBe('No deadline');
    expect(formatDate('2026-10-20T12:00:00Z')).toContain('2026');
  });

  test('isDateToday returns true for current date', () => {
    const today = new Date().toISOString();
    expect(isDateToday(today)).toBe(true);
    expect(isDateToday('2020-01-01T00:00:00Z')).toBe(false);
    expect(isDateToday(null)).toBe(false);
  });

  test('isTaskOverdue returns true only when task is incomplete and due date is in the past', () => {
    expect(isTaskOverdue({ isCompleted: false, dueAt: '2020-01-01T00:00:00Z' })).toBe(true);
    expect(isTaskOverdue({ isCompleted: true, dueAt: '2020-01-01T00:00:00Z' })).toBe(false);
    expect(isTaskOverdue({ isCompleted: false, dueAt: '2099-01-01T00:00:00Z' })).toBe(false);
    expect(isTaskOverdue({ isCompleted: false, dueAt: null })).toBe(false);
  });

  test('getGreeting returns valid time-based greeting', () => {
    const greeting = getGreeting();
    expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(greeting);
  });
});

describe('Mobile Client Task Ranking Algorithm', () => {
  const mockTask = (overrides: Partial<Task> = {}): Task => ({
    _id: 'task-1',
    owner: 'user-1',
    title: 'Sample Task',
    description: '',
    priority: 'Medium',
    category: 'Work',
    isCompleted: false,
    completedAt: null,
    scheduledAt: null,
    dueAt: null,
    createdAt: '2026-10-20T08:00:00Z',
    updatedAt: '2026-10-20T08:00:00Z',
    ...overrides,
  });

  test('Prioritizes incomplete tasks before completed tasks', () => {
    const t1 = mockTask({ _id: '1', title: 'Done', isCompleted: true });
    const t2 = mockTask({ _id: '2', title: 'Pending', isCompleted: false });
    const ranked = rankTasks([t1, t2]);
    expect(ranked[0].title).toBe('Pending');
    expect(ranked[1].title).toBe('Done');
  });

  test('Prioritizes overdue incomplete tasks first', () => {
    const future = mockTask({ _id: '1', title: 'Future', dueAt: '2099-10-20T00:00:00Z', priority: 'Urgent' });
    const overdue = mockTask({ _id: '2', title: 'Overdue', dueAt: '2020-10-20T00:00:00Z', priority: 'Low' });
    const ranked = rankTasks([future, overdue]);
    expect(ranked[0].title).toBe('Overdue');
  });

  test('Prioritizes earlier deadline before later deadline', () => {
    const early = mockTask({ _id: '1', title: 'Early Due', dueAt: '2026-10-21T00:00:00Z' });
    const late = mockTask({ _id: '2', title: 'Late Due', dueAt: '2026-10-25T00:00:00Z' });
    const ranked = rankTasks([late, early]);
    expect(ranked[0].title).toBe('Early Due');
  });

  test('Breaks equal deadline tie with priority weight', () => {
    const sameDue = '2026-10-25T00:00:00Z';
    const low = mockTask({ _id: '1', title: 'Low', dueAt: sameDue, priority: 'Low' });
    const urgent = mockTask({ _id: '2', title: 'Urgent', dueAt: sameDue, priority: 'Urgent' });
    const ranked = rankTasks([low, urgent]);
    expect(ranked[0].title).toBe('Urgent');
    expect(ranked[1].title).toBe('Low');
  });
});

describe('Mobile Form Validation Schemas', () => {
  test('loginSchema validates email and password presence', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com', password: 'secret' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'invalid-email', password: 'secret' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: '', password: '' }).success).toBe(false);
  });

  test('registerSchema rejects mismatched passwords', () => {
    const res = registerSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'differentPassword',
    });
    expect(res.success).toBe(false);
  });

  test('taskFormSchema rejects scheduled date after deadline', () => {
    const res = taskFormSchema.safeParse({
      title: 'Task Title',
      scheduledAt: '2026-10-25T10:00:00Z',
      dueAt: '2026-10-20T10:00:00Z', // Prior to scheduled
      category: 'Work',
      priority: 'High',
    });
    expect(res.success).toBe(false);
  });
});

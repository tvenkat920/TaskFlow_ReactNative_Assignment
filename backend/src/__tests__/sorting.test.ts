import { compareTasks, rankTasks, isTaskOverdue, PRIORITY_WEIGHTS } from '../utils/sorting';
import { ITask } from '../types';
import { Types } from 'mongoose';

describe('Deterministic Task-Ranking Algorithm', () => {
  const baseTime = new Date('2026-10-20T12:00:00.000Z');

  const createMockTask = (overrides: Partial<ITask> = {}): ITask => ({
    _id: new Types.ObjectId(),
    owner: new Types.ObjectId(),
    title: 'Test Task',
    description: '',
    priority: 'Medium',
    category: 'Work',
    isCompleted: false,
    completedAt: null,
    scheduledAt: null,
    dueAt: null,
    createdAt: new Date('2026-10-20T08:00:00.000Z'),
    updatedAt: new Date('2026-10-20T08:00:00.000Z'),
    ...overrides,
  });

  test('Rule 1: Incomplete tasks always precede completed tasks', () => {
    const incomplete = createMockTask({ title: 'Pending Task', isCompleted: false });
    const completed = createMockTask({
      title: 'Done Task',
      isCompleted: true,
      completedAt: new Date('2026-10-20T11:00:00.000Z'),
    });

    const sorted = rankTasks([completed, incomplete], baseTime);
    expect(sorted[0].title).toBe('Pending Task');
    expect(sorted[1].title).toBe('Done Task');
  });

  test('Completed view: Most recently completed tasks come first', () => {
    const earlierCompleted = createMockTask({
      title: 'Earlier Done',
      isCompleted: true,
      completedAt: new Date('2026-10-20T09:00:00.000Z'),
    });
    const laterCompleted = createMockTask({
      title: 'Later Done',
      isCompleted: true,
      completedAt: new Date('2026-10-20T11:30:00.000Z'),
    });

    const sorted = rankTasks([earlierCompleted, laterCompleted], baseTime);
    expect(sorted[0].title).toBe('Later Done');
    expect(sorted[1].title).toBe('Earlier Done');
  });

  test('Rule 2: Overdue tasks precede non-overdue tasks', () => {
    const overdueTask = createMockTask({
      title: 'Overdue Task',
      dueAt: new Date('2026-10-19T10:00:00.000Z'), // Past
      isCompleted: false,
      priority: 'Low',
    });
    const futureTask = createMockTask({
      title: 'Future Task',
      dueAt: new Date('2026-10-21T10:00:00.000Z'), // Future
      isCompleted: false,
      priority: 'Urgent',
    });

    const sorted = rankTasks([futureTask, overdueTask], baseTime);
    expect(sorted[0].title).toBe('Overdue Task');
    expect(sorted[1].title).toBe('Future Task');
  });

  test('Rule 3: Earlier deadlines precede later deadlines; tasks without deadline go later', () => {
    const noDeadline = createMockTask({
      title: 'No Deadline',
      dueAt: null,
      priority: 'Urgent',
    });
    const laterDeadline = createMockTask({
      title: 'Later Deadline',
      dueAt: new Date('2026-10-25T10:00:00.000Z'),
      priority: 'High',
    });
    const earlierDeadline = createMockTask({
      title: 'Earlier Deadline',
      dueAt: new Date('2026-10-22T10:00:00.000Z'),
      priority: 'Low',
    });

    const sorted = rankTasks([noDeadline, laterDeadline, earlierDeadline], baseTime);
    expect(sorted[0].title).toBe('Earlier Deadline');
    expect(sorted[1].title).toBe('Later Deadline');
    expect(sorted[2].title).toBe('No Deadline');
  });

  test('Rule 4: Higher priority breaks ties when deadlines are identical or absent', () => {
    const sameDue = new Date('2026-10-24T12:00:00.000Z');
    const urgent = createMockTask({ title: 'Urgent Task', dueAt: sameDue, priority: 'Urgent' });
    const medium = createMockTask({ title: 'Medium Task', dueAt: sameDue, priority: 'Medium' });
    const low = createMockTask({ title: 'Low Task', dueAt: sameDue, priority: 'Low' });
    const high = createMockTask({ title: 'High Task', dueAt: sameDue, priority: 'High' });

    const sorted = rankTasks([low, medium, urgent, high], baseTime);
    expect(sorted.map((t) => t.title)).toEqual(['Urgent Task', 'High Task', 'Medium Task', 'Low Task']);
  });

  test('Rule 5: Earlier scheduled time breaks ties when deadlines & priority are identical', () => {
    const taskEarlySched = createMockTask({
      title: 'Scheduled 9 AM',
      priority: 'High',
      scheduledAt: new Date('2026-10-20T09:00:00.000Z'),
    });
    const taskLateSched = createMockTask({
      title: 'Scheduled 3 PM',
      priority: 'High',
      scheduledAt: new Date('2026-10-20T15:00:00.000Z'),
    });
    const taskNoSched = createMockTask({
      title: 'Not Scheduled',
      priority: 'High',
      scheduledAt: null,
    });

    const sorted = rankTasks([taskNoSched, taskLateSched, taskEarlySched], baseTime);
    expect(sorted[0].title).toBe('Scheduled 9 AM');
    expect(sorted[1].title).toBe('Scheduled 3 PM');
    expect(sorted[2].title).toBe('Not Scheduled');
  });

  test('Rule 6: Newest creation time is the final tie-breaker', () => {
    const older = createMockTask({
      title: 'Older Created',
      createdAt: new Date('2026-10-18T10:00:00.000Z'),
    });
    const newer = createMockTask({
      title: 'Newer Created',
      createdAt: new Date('2026-10-20T10:00:00.000Z'),
    });

    const sorted = rankTasks([older, newer], baseTime);
    expect(sorted[0].title).toBe('Newer Created');
    expect(sorted[1].title).toBe('Older Created');
  });

  test('isTaskOverdue helper correctly identifies overdue status', () => {
    expect(isTaskOverdue({ isCompleted: false, dueAt: new Date('2026-10-19T00:00:00Z') }, baseTime)).toBe(true);
    expect(isTaskOverdue({ isCompleted: true, dueAt: new Date('2026-10-19T00:00:00Z') }, baseTime)).toBe(false);
    expect(isTaskOverdue({ isCompleted: false, dueAt: new Date('2026-10-22T00:00:00Z') }, baseTime)).toBe(false);
    expect(isTaskOverdue({ isCompleted: false, dueAt: null }, baseTime)).toBe(false);
  });
});

import { Types } from 'mongoose';
import { Task, ITaskDocument } from '../models/Task';
import { ITask } from '../types';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '../validators/taskValidators';
import { rankTasks, isTaskOverdue } from '../utils/sorting';

export class TaskService {
  /**
   * Retrieves tasks for the authenticated user with search, filter, and deterministic ranking
   */
  public static async getTasks(
    userId: string,
    query: TaskQueryInput
  ): Promise<{ tasks: ITask[]; stats: { total: number; completed: number; pending: number; overdue: number } }> {
    const ownerId = new Types.ObjectId(userId);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Base query scoped to the authenticated owner
    const mongoQuery: any = { owner: ownerId };

    // Search query on title or description
    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      mongoQuery.$or = [{ title: searchRegex }, { description: searchRegex }, { category: searchRegex }];
    }

    // Category filter
    if (query.category && query.category.trim() && query.category !== 'All') {
      mongoQuery.category = new RegExp(`^${query.category.trim()}$`, 'i');
    }

    // Priority filter
    if (query.priority) {
      mongoQuery.priority = query.priority;
    }

    // Status filter
    switch (query.status) {
      case 'pending':
        mongoQuery.isCompleted = false;
        break;
      case 'completed':
        mongoQuery.isCompleted = true;
        break;
      case 'today':
        mongoQuery.dueAt = { $gte: startOfToday, $lte: endOfToday };
        break;
      case 'upcoming':
        mongoQuery.dueAt = { $gt: endOfToday };
        break;
      case 'overdue':
        mongoQuery.isCompleted = false;
        mongoQuery.dueAt = { $lt: now, $ne: null };
        break;
      case 'all':
      default:
        // No additional filter on completion/dates
        break;
    }

    // Fetch matching tasks
    const rawTasks = await Task.find(mongoQuery).lean().exec();

    // Calculate user-wide stats (always calculated across all user's tasks for dashboard cards)
    const allUserTasks = await Task.find({ owner: ownerId }).select('isCompleted dueAt').lean().exec();
    const total = allUserTasks.length;
    let completed = 0;
    let pending = 0;
    let overdue = 0;

    for (const t of allUserTasks) {
      if (t.isCompleted) {
        completed++;
      } else {
        pending++;
        if (isTaskOverdue(t as any, now)) {
          overdue++;
        }
      }
    }

    const stats = { total, completed, pending, overdue };

    // Sort tasks
    let sortedTasks: ITask[] = [];

    if (query.sort === 'rank') {
      // Deterministic ranking algorithm
      sortedTasks = rankTasks(rawTasks as unknown as ITask[], now);
    } else if (query.sort === 'dueAt_asc') {
      sortedTasks = (rawTasks as unknown as ITask[]).sort((a, b) => {
        if (!a.dueAt) return 1;
        if (!b.dueAt) return -1;
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      });
    } else if (query.sort === 'dueAt_desc') {
      sortedTasks = (rawTasks as unknown as ITask[]).sort((a, b) => {
        if (!a.dueAt) return 1;
        if (!b.dueAt) return -1;
        return new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime();
      });
    } else if (query.sort === 'priority_desc') {
      const weights: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      sortedTasks = (rawTasks as unknown as ITask[]).sort((a, b) => (weights[b.priority] || 0) - (weights[a.priority] || 0));
    } else if (query.sort === 'createdAt_desc') {
      sortedTasks = (rawTasks as unknown as ITask[]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      sortedTasks = rankTasks(rawTasks as unknown as ITask[], now);
    }

    return { tasks: sortedTasks, stats };
  }

  /**
   * Retrieves a single task ensuring strict owner isolation
   */
  public static async getTaskById(taskId: string, userId: string): Promise<ITaskDocument> {
    if (!Types.ObjectId.isValid(taskId)) {
      const err: any = new Error('Invalid task ID format.');
      err.statusCode = 400;
      throw err;
    }

    const task = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      owner: new Types.ObjectId(userId),
    });

    if (!task) {
      const err: any = new Error('Task not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    return task;
  }

  /**
   * Creates a new task bound to the authenticated user
   */
  public static async createTask(userId: string, input: CreateTaskInput): Promise<ITaskDocument> {
    const task = await Task.create({
      owner: new Types.ObjectId(userId),
      title: input.title.trim(),
      description: input.description?.trim() || '',
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
      priority: input.priority || 'Medium',
      category: input.category?.trim() || 'General',
      isCompleted: false,
      completedAt: null,
    });

    return task;
  }

  /**
   * Updates an existing task with mass-assignment protection
   */
  public static async updateTask(taskId: string, userId: string, input: UpdateTaskInput): Promise<ITaskDocument> {
    const task = await this.getTaskById(taskId, userId);

    if (input.title !== undefined) task.title = input.title.trim();
    if (input.description !== undefined) task.description = input.description.trim();
    if (input.scheduledAt !== undefined) task.scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
    if (input.dueAt !== undefined) task.dueAt = input.dueAt ? new Date(input.dueAt) : null;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.category !== undefined) task.category = input.category.trim();

    if (input.isCompleted !== undefined) {
      task.isCompleted = input.isCompleted;
      task.completedAt = input.isCompleted ? new Date() : null;
    }

    await task.save();
    return task;
  }

  /**
   * Toggles completion status of a task
   */
  public static async toggleComplete(taskId: string, userId: string): Promise<ITaskDocument> {
    const task = await this.getTaskById(taskId, userId);
    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date() : null;
    await task.save();
    return task;
  }

  /**
   * Deletes a task ensuring user owns the resource
   */
  public static async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this.getTaskById(taskId, userId);
    await task.deleteOne();
  }
}

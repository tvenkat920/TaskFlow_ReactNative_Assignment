import { Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { AuthenticatedRequest } from '../types';

export class TaskController {
  public static async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await TaskService.getTasks(userId, req.query as any);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;
      const task = await TaskService.getTaskById(taskId, userId);
      res.status(200).json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const task = await TaskService.createTask(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;
      const task = await TaskService.updateTask(taskId, userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async toggleComplete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;
      const task = await TaskService.toggleComplete(taskId, userId);
      res.status(200).json({
        success: true,
        message: task.isCompleted ? 'Task marked as completed' : 'Task reopened',
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;
      await TaskService.deleteTask(taskId, userId);
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

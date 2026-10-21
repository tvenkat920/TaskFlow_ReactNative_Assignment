import { Request } from 'express';
import { Types } from 'mongoose';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  title: string;
  description: string;
  scheduledAt?: Date | null;
  dueAt?: Date | null;
  priority: TaskPriority;
  category: string;
  isCompleted: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

import mongoose, { Schema, Document } from 'mongoose';
import { ITask, TaskPriority } from '../types';

export interface ITaskDocument extends Document, Omit<ITask, '_id'> {}

const taskSchema = new Schema<ITaskDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task owner is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Task title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    dueAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [50, 'Category cannot exceed 50 characters'],
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for performant querying and filtering per owner
taskSchema.index({ owner: 1, isCompleted: 1, dueAt: 1 });
taskSchema.index({ owner: 1, priority: 1 });
taskSchema.index({ owner: 1, category: 1 });
taskSchema.index({ owner: 1, createdAt: -1 });

export const Task = mongoose.model<ITaskDocument>('Task', taskSchema);

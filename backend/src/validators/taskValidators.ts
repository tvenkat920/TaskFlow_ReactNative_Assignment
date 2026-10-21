import { z } from 'zod';

const priorityEnum = z.enum(['Low', 'Medium', 'High', 'Urgent']);

const isoDateString = z
  .string()
  .datetime({ offset: true, message: 'Must be a valid ISO 8601 date string' })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?)?(Z|[+-]\d{2}:?\d{2})?$/, 'Must be a valid date format'))
  .nullable()
  .optional();

export const createTaskSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(1, 'Title cannot be empty')
      .max(150, 'Title cannot exceed 150 characters'),
    description: z
      .string()
      .trim()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional()
      .default(''),
    scheduledAt: isoDateString,
    dueAt: isoDateString,
    priority: priorityEnum.optional().default('Medium'),
    category: z
      .string()
      .trim()
      .max(50, 'Category cannot exceed 50 characters')
      .optional()
      .default('General'),
  })
  .refine(
    (data) => {
      if (data.scheduledAt && data.dueAt) {
        return new Date(data.scheduledAt).getTime() <= new Date(data.dueAt).getTime();
      }
      return true;
    },
    {
      message: 'Scheduled date cannot be later than deadline date',
      path: ['scheduledAt'],
    }
  );

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(150, 'Title cannot exceed 150 characters')
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional(),
    scheduledAt: isoDateString,
    dueAt: isoDateString,
    priority: priorityEnum.optional(),
    category: z
      .string()
      .trim()
      .max(50, 'Category cannot exceed 50 characters')
      .optional(),
    isCompleted: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.scheduledAt && data.dueAt) {
        return new Date(data.scheduledAt).getTime() <= new Date(data.dueAt).getTime();
      }
      return true;
    },
    {
      message: 'Scheduled date cannot be later than deadline date',
      path: ['scheduledAt'],
    }
  );

export const taskQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'pending', 'completed', 'today', 'upcoming', 'overdue']).optional().default('all'),
  priority: priorityEnum.optional(),
  category: z.string().optional(),
  sort: z.enum(['rank', 'dueAt_asc', 'dueAt_desc', 'priority_desc', 'createdAt_desc']).optional().default('rank'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;

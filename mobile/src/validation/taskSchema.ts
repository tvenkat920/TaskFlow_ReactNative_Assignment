import { z } from 'zod';

export const taskFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Task title is required')
      .max(150, 'Title cannot exceed 150 characters'),
    description: z
      .string()
      .trim()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional()
      .default(''),
    category: z
      .string()
      .trim()
      .min(1, 'Category is required')
      .max(50, 'Category cannot exceed 50 characters')
      .default('General'),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
    scheduledAt: z.string().nullable().optional(),
    dueAt: z.string().nullable().optional(),
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

export type TaskFormData = z.infer<typeof taskFormSchema>;

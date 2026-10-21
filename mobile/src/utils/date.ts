/**
 * Date and time formatting utilities for TaskFlow
 */

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'No deadline';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (dateString?: string | null): string => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return 'Not set';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';

  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

export const isDateToday = (dateString?: string | null): boolean => {
  if (!dateString) return false;
  const d = new Date(dateString);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

export const isTaskOverdue = (task: { isCompleted?: boolean; dueAt?: string | null }): boolean => {
  if (task.isCompleted || !task.dueAt) return false;
  const due = new Date(task.dueAt).getTime();
  return due < Date.now();
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

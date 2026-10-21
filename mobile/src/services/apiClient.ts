import { API_CONFIG } from '../config/api';
import { storage } from './storage';
import { Task, TaskPriority, TaskStats, User } from '../types';

// Standalone Axios-based or fetch-based API client for React Native
class ApiClient {
  private baseURL: string;
  private onUnauthorizedCallback?: () => void;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  public setBaseURL(url: string) {
    this.baseURL = url;
  }

  public getBaseURL(): string {
    return this.baseURL;
  }

  public onUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await storage.getToken();
    const candidateBases = Array.from(new Set([this.baseURL, 'http://192.168.1.4:5000/api', 'http://localhost:5000/api', 'http://10.0.2.2:5000/api']));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let lastError: any = null;

    for (const base of candidateBases) {
      const url = `${base}${endpoint}`;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Success! Remember this working base URL
        this.baseURL = base;

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          await storage.clearSession();
          if (this.onUnauthorizedCallback) {
            this.onUnauthorizedCallback();
          }
          throw new Error(data.error || 'Session expired. Please log in again.');
        }

        if (!response.ok) {
          const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
          const err: any = new Error(errorMsg);
          err.status = response.status;
          err.errors = data.errors;
          throw err;
        }

        return data;
      } catch (error: any) {
        lastError = error;
        // If it's a 4xx validation or auth error (not network error), don't try other hosts
        if (error.status && error.status < 500) {
          throw error;
        }
        // Otherwise, continue to try next candidate base URL
      }
    }

    throw lastError || new Error('Cannot connect to TaskFlow server. Please ensure backend is running.');
  }

  // Auth API
  public auth = {
    register: async (input: { name: string; email: string; password: string; confirmPassword?: string }) => {
      const res = await this.request<{ success: boolean; data: { user: User; token: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.data;
    },

    login: async (input: { email: string; password: string }) => {
      const res = await this.request<{ success: boolean; data: { user: User; token: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.data;
    },

    getMe: async () => {
      const res = await this.request<{ success: boolean; data: { user: User } }>('/auth/me', {
        method: 'GET',
      });
      return res.data.user;
    },

    logout: async () => {
      try {
        await this.request('/auth/logout', { method: 'POST' });
      } catch (e) {
        // Ignore logout network errors; storage clear is primary
      } finally {
        await storage.clearSession();
      }
    },
  };

  // Task API
  public tasks = {
    getAll: async (params?: { search?: string; status?: string; priority?: TaskPriority; category?: string; sort?: string }) => {
      const queryParts: string[] = [];
      if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      if (params?.status && params.status !== 'all') queryParts.push(`status=${encodeURIComponent(params.status)}`);
      if (params?.priority) queryParts.push(`priority=${encodeURIComponent(params.priority)}`);
      if (params?.category && params.category !== 'All') queryParts.push(`category=${encodeURIComponent(params.category)}`);
      if (params?.sort) queryParts.push(`sort=${encodeURIComponent(params.sort)}`);

      const queryStr = queryParts.length ? `?${queryParts.join('&')}` : '';
      const res = await this.request<{ success: boolean; data: { tasks: Task[]; stats: TaskStats } }>(`/tasks${queryStr}`, {
        method: 'GET',
      });
      return res.data;
    },

    getById: async (id: string) => {
      const res = await this.request<{ success: boolean; data: { task: Task } }>(`/tasks/${id}`, {
        method: 'GET',
      });
      return res.data.task;
    },

    create: async (data: {
      title: string;
      description?: string;
      scheduledAt?: string | null;
      dueAt?: string | null;
      priority?: TaskPriority;
      category?: string;
    }) => {
      const res = await this.request<{ success: boolean; data: { task: Task } }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.data.task;
    },

    update: async (
      id: string,
      data: {
        title?: string;
        description?: string;
        scheduledAt?: string | null;
        dueAt?: string | null;
        priority?: TaskPriority;
        category?: string;
        isCompleted?: boolean;
      }
    ) => {
      const res = await this.request<{ success: boolean; data: { task: Task } }>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return res.data.task;
    },

    toggleComplete: async (id: string) => {
      const res = await this.request<{ success: boolean; data: { task: Task } }>(`/tasks/${id}/complete`, {
        method: 'PATCH',
      });
      return res.data.task;
    },

    delete: async (id: string) => {
      const res = await this.request<{ success: boolean; message: string }>(`/tasks/${id}`, {
        method: 'DELETE',
      });
      return res.success;
    },
  };
}

export const apiClient = new ApiClient();

import request from 'supertest';
import { createApp } from '../app';
import { setupTestDB } from './setup';

describe('Tasks REST API Endpoints & Ownership Isolation', () => {
  setupTestDB();
  const app = createApp();

  let tokenUserA: string;
  let tokenUserB: string;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'usera@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    tokenUserA = resA.body.data.token;

    // Register User B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'userb@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    tokenUserB = resB.body.data.token;
  });

  describe('POST /api/tasks (Create Task)', () => {
    test('should create a task successfully for authenticated user', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Complete Assignment',
          description: 'Build production React Native and Express app',
          priority: 'Urgent',
          category: 'Work',
          scheduledAt: '2026-10-21T09:00:00.000Z',
          dueAt: '2026-10-22T17:00:00.000Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.title).toBe('Complete Assignment');
      expect(res.body.data.task.priority).toBe('Urgent');
      expect(res.body.data.task.isCompleted).toBe(false);
      expect(res.body.data.task.completedAt).toBeNull();
    });

    test('should reject task creation with missing/empty title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: '   ',
          description: 'No title test',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject task when scheduled date is after deadline', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Invalid Date Sequence',
          scheduledAt: '2026-10-25T10:00:00.000Z',
          dueAt: '2026-10-20T10:00:00.000Z', // Deadline earlier than scheduled date
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/scheduled date cannot be later than deadline/i);
    });
  });

  describe('STRICT OWNERSHIP ISOLATION', () => {
    let taskUserAId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: "User A's Confidential Task",
          description: 'Top secret plan',
          priority: 'High',
        });
      taskUserAId = res.body.data.task._id;
    });

    test("User B CANNOT view User A's task in task list", async () => {
      const resA = await request(app).get('/api/tasks').set('Authorization', `Bearer ${tokenUserA}`);
      expect(resA.body.data.tasks.length).toBe(1);

      const resB = await request(app).get('/api/tasks').set('Authorization', `Bearer ${tokenUserB}`);
      expect(resB.body.data.tasks.length).toBe(0); // Isolated
    });

    test("User B CANNOT get User A's task by ID (returns 404)", async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskUserAId}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("User B CANNOT update User A's task (returns 404)", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskUserAId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ title: 'Hacked by User B' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify task in DB was not modified
      const check = await request(app)
        .get(`/api/tasks/${taskUserAId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);
      expect(check.body.data.task.title).toBe("User A's Confidential Task");
    });

    test("User B CANNOT toggle completion on User A's task (returns 404)", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskUserAId}/complete`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("User B CANNOT delete User A's task (returns 404)", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskUserAId}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify task still exists for User A
      const check = await request(app)
        .get(`/api/tasks/${taskUserAId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);
      expect(check.status).toBe(200);
    });
  });

  describe('PATCH /api/tasks/:id/complete (Toggle Completion)', () => {
    test('should toggle task completion and update completedAt timestamp correctly', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: 'Task to Complete' });
      const taskId = createRes.body.data.task._id;

      // Complete the task
      const completeRes = await request(app)
        .patch(`/api/tasks/${taskId}/complete`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data.task.isCompleted).toBe(true);
      expect(completeRes.body.data.task.completedAt).not.toBeNull();

      // Reopen the task
      const reopenRes = await request(app)
        .patch(`/api/tasks/${taskId}/complete`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(reopenRes.status).toBe(200);
      expect(reopenRes.body.data.task.isCompleted).toBe(false);
      expect(reopenRes.body.data.task.completedAt).toBeNull();
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('should delete task successfully for owner', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: 'Task to Delete' });
      const taskId = createRes.body.data.task._id;

      const deleteRes = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Attempting to retrieve again should return 404
      const getRes = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('GET /api/tasks (Filtering and Search)', () => {
    beforeEach(async () => {
      // Create diverse set of tasks
      await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenUserA}`).send({
        title: 'Buy Groceries',
        category: 'Personal',
        priority: 'Low',
      });
      await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenUserA}`).send({
        title: 'Submit Tax Report',
        category: 'Finance',
        priority: 'Urgent',
        dueAt: '2026-10-15T00:00:00.000Z', // Overdue
      });
      await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenUserA}`).send({
        title: 'Client Review Meeting',
        category: 'Work',
        priority: 'High',
      });
    });

    test('should filter tasks by category', async () => {
      const res = await request(app)
        .get('/api/tasks?category=Work')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(1);
      expect(res.body.data.tasks[0].title).toBe('Client Review Meeting');
    });

    test('should filter tasks by search keyword', async () => {
      const res = await request(app)
        .get('/api/tasks?search=groceries')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(1);
      expect(res.body.data.tasks[0].title).toBe('Buy Groceries');
    });

    test('should return correct task stats in response', async () => {
      const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.stats).toBeDefined();
      expect(res.body.data.stats.total).toBe(3);
      expect(res.body.data.stats.pending).toBe(3);
      expect(res.body.data.stats.completed).toBe(0);
      expect(res.body.data.stats.overdue).toBe(1);
    });
  });
});

import request from 'supertest';
import { createApp } from '../app';
import { setupTestDB } from './setup';

describe('Auth REST API Endpoints', () => {
  setupTestDB();
  const app = createApp();

  const validUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  };

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.user.name).toBe('Jane Doe');
      expect(res.body.data.user.password).toBeUndefined(); // Never expose password
      expect(res.body.data.token).toBeDefined();
    });

    test('should reject duplicate email with 409 Conflict', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const res = await request(app).post('/api/auth/register').send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/already exists/i);
    });

    test('should reject mismatched passwords with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'different@example.com', confirmPassword: 'wrongPassword' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/passwords do not match/i);
    });

    test('should reject short password with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'short@example.com', password: '123', confirmPassword: '123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject invalid email format with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'invalid-email-format' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
    });

    test('should log in with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'jane@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('jane@example.com');
    });

    test('should reject incorrect password with 401 Unauthorized', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'jane@example.com',
        password: 'wrongPassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/invalid email or password/i);
    });

    test('should reject nonexistent email with 401 Unauthorized', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'notfound@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token: string;

    beforeEach(async () => {
      const reg = await request(app).post('/api/auth/register').send(validUser);
      token = reg.body.data.token;
    });

    test('should return authenticated user profile with valid Bearer token', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.user.name).toBe('Jane Doe');
      expect(res.body.data.user.password).toBeUndefined();
    });

    test('should reject access with 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('should reject access with 401 when invalid token is provided', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should return 200 with logout confirmation', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

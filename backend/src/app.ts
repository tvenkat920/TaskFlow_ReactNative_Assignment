import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware';
import { config } from './config/env';

export const createApp = (): Application => {
  const app = express();

  // Security HTTP headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request body parsing with safe payload limits
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      service: 'TaskFlow REST API',
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);

  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Centralized error handling
  app.use(errorHandler);

  return app;
};

import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Never expose sensitive internal traces to client
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    res.status(409).json({
      success: false,
      error: `An account with that ${field} already exists.`,
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: `Invalid format for resource ID: ${err.value}`,
    });
    return;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors: Record<string, string> = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
    res.status(400).json({
      success: false,
      error: 'Database validation failed',
      errors,
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};

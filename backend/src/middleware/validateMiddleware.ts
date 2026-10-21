import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

export const validateBody = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path.join('.') || 'field';
          errors[field] = err.message;
        });

        res.status(400).json({
          success: false,
          error: error.errors[0]?.message || 'Validation error',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path.join('.') || 'param';
          errors[field] = err.message;
        });

        res.status(400).json({
          success: false,
          error: error.errors[0]?.message || 'Query validation error',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};

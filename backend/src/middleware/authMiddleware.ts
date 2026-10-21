import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthenticatedRequest, AuthenticatedUser } from '../types';
import { User } from '../models/User';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Access denied. No authentication token provided.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; name: string };
    
    // Verify that the user still exists in database
    const user = await User.findById(decoded.id).select('_id email name');
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid session. User account no longer exists.',
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Authentication token has expired. Please log in again.',
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Invalid authentication token.',
    });
  }
};

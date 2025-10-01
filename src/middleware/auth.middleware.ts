// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JWTUtils, JWTPayload } from '../utils/jwt';
import { User } from '../models/User.model';
import { AppError } from '../utils/AppError';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload & { isActive?: boolean };
}

export class AuthMiddleware {
  public static async authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Access token is required', 401);
      }

      const token = authHeader.substring(7); 

      if (!token) {
        throw new AppError('Access token is required', 401);
      }

      const decoded = JWTUtils.verifyAccessToken(token);

      const user = await User.findById(decoded.id).select('+isActive');
      
      if (!user) {
        throw new AppError('User no longer exists', 401);
      }

      if (!user.isActive) {
        throw new AppError('User account is deactivated', 401);
      }

      // Add user info to request
      req.user = {
        ...decoded,
        isActive: user.isActive
      };

      next();
    } catch (error: any) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Invalid or expired token', 401));
      }
    }
  }

  public static authorize(...roles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      if (!roles.includes(req.user.role)) {
        return next(new AppError('Insufficient permissions', 403));
      }

      next();
    };
  }
}
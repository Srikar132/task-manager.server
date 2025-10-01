// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export class ErrorMiddleware {
  public static handleError(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = 'Invalid resource ID';
      error = new AppError(message, 400);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `${field} already exists`;
      error = new AppError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
      error = new AppError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      const message = 'Invalid token';
      error = new AppError(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
      const message = 'Token expired';
      error = new AppError(message, 401);
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  }

  public static handle404(req: Request, res: Response, next: NextFunction): void {
    const error = new AppError(`Not found - ${req.originalUrl}`, 404);
    next(error);
  }
}
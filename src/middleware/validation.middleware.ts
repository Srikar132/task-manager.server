// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError';

export class ValidationMiddleware {
  public static handleValidationErrors(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        message: error.msg,        
        type: error.type
      }));

      const errorMessage = `Validation failed: ${formattedErrors.map(e => e.message).join(', ')}`;
      return next(new AppError(errorMessage, 400));
    }

    next();
  }
}
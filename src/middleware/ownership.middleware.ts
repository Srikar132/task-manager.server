import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { Task } from '../models/Task.model';
import { AppError } from '../utils/AppError';
import { Permission, PermissionChecker } from '../utils/permissions';

export class OwnershipMiddleware {
  public static async checkTaskOwnership(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = req.params.id || req.params.taskId;
      const userId = req.user?.id;

      if (!taskId) {
        return next(new AppError('Task ID is required', 400));
      }

      if (!userId) {
        return next(new AppError('User authentication required', 401));
      }

      // Admin can access all tasks
      if (PermissionChecker.hasPermission(req.user!.role, Permission.READ_ALL_TASKS)) {
        return next();
      }

      // Check if task exists and belongs to user
      const task = await Task.findById(taskId);

      if (!task) {
        return next(new AppError('Task not found', 404));
      }

      if (task.userId.toString() !== userId) {
        return next(new AppError('Access denied: You can only access your own tasks', 403));
      }

      next();
    } catch (error: any) {
      next(new AppError('Error checking task ownership', 500));
    }
  }
}
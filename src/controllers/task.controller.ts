import AsyncHandler from "express-async-handler";
import { Response } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { Task } from "../models/Task.model";
import { ResponseHandler } from "../utils/response";
import { Permission, PermissionChecker } from "../utils/permissions";
import { AppError } from "../utils/AppError";

export class TaskController {
    public createTask = AsyncHandler(
        async (req: AuthenticatedRequest, res: Response) => {
            const { title, description, status, priority, dueDate } = req.body;
            const userId = req.user?.id;

            const task = await Task.create({
                title,
                description,
                status,
                priority,
                dueDate,
                userId
            });

            ResponseHandler.created(res, task, 'Task created successfully');
        }
    );

    public getTasks = AsyncHandler(
        async (req: AuthenticatedRequest, res: Response) => {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const { status, priority, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

            const query: any = {};
            if (!PermissionChecker.hasPermission(req.user?.role!, Permission.READ_ALL_TASKS)) {
                query.userId = req.user?.id;
            }

            if (status) query.status = status;
            if (priority) query.priority = priority;

            const [tasks, total] = await Promise.all([
                Task.find(query)
                    .sort({ [sortBy as string]: sortOrder === 'DESC' ? -1 : 1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Task.countDocuments(query)
            ]);

            ResponseHandler.success(res, tasks, 'Tasks retrieved successfully', 200, {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            });
        }
    );

    public getTaskById = AsyncHandler(
        async (req: AuthenticatedRequest, res: Response) => {
            const { id } = req.params;

            const task = await Task.findById(id);
            if (!task) {
                ResponseHandler.error(res, 'Task not found', 404);
                return;
            }

            if (!PermissionChecker.hasPermission(req.user?.role!, Permission.READ_ALL_TASKS)) {
                if (task.userId.toString() !== req.user?.id) {
                    throw new AppError('Access denied', 403);
                }
            }

            ResponseHandler.success(res, task, 'Task retrieved successfully');
        }
    );

    public updateTask = AsyncHandler(
        async (req: AuthenticatedRequest, res: Response) => {
            const { id } = req.params;
            const { title, description, status, priority, dueDate } = req.body;

            const task = await Task.findById(id);
            if (!task) {
                throw new AppError('Task not found', 404);
            }

            if (!PermissionChecker.hasPermission(req.user?.role!, Permission.UPDATE_ALL_TASKS)) {
                if (task.userId.toString() !== req.user?.id) {
                    throw new AppError('Access denied', 403);
                }
            }

            const updatedTask = await Task.findByIdAndUpdate(
                id,
                { title, description, status, priority, dueDate },
                { new: true }
            );

            ResponseHandler.success(res, updatedTask, 'Task updated successfully');
        }
    );

    public deleteTask = AsyncHandler(
        async (req: AuthenticatedRequest, res: Response) => {
            const { id } = req.params;

            const task = await Task.findById(id);
            if (!task) {
                throw new AppError('Task not found', 404);
            }

            if (!PermissionChecker.hasPermission(req.user?.role!, Permission.DELETE_ALL_TASKS)) {
                if (task.userId.toString() !== req.user?.id) {
                    throw new AppError('Access denied', 403);
                }
            }

            await task.deleteOne();

            ResponseHandler.success(res, null, 'Task deleted successfully');
        }
    );

    public getStatistics = AsyncHandler(
        async (req: AuthenticatedRequest, res: Response) => {
            const userId = req.user?.id;

            const matchCondition: any = {};
            if (!PermissionChecker.hasPermission(req.user?.role!, Permission.READ_ALL_TASKS)) {
                matchCondition.userId = mongoose.Types.ObjectId.isValid(userId!)
                    ? new mongoose.Types.ObjectId(userId)
                    : userId;
            }

            const currentDate = new Date();

            const stats = await Task.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
                        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
                        medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
                        low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
                        overdue: {
                            $sum: {
                                $cond: [
                                    { $and: [{ $ne: ['$status', 'completed'] }, { $ne: ['$dueDate', null] }, { $lt: ['$dueDate', currentDate] }] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            const result = stats[0] || {
                total: 0,
                pending: 0,
                inProgress: 0,
                completed: 0,
                high: 0,
                medium: 0,
                low: 0,
                overdue: 0
            };

            if (result._id) {
                delete result._id;
            }

            ResponseHandler.success(res, result, 'Task statistics retrieved successfully');
        }
    );
}

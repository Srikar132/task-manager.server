import expressAsyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { User } from "../models/User.model";
import { ResponseHandler } from "../utils/response";
import { AppError } from "../utils/AppError";
import { Task } from "../models/Task.model";

export class AdminController {
    public  getAllUsers = expressAsyncHandler(
        async (req: AuthenticatedRequest, res: Response) => {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const [users, total] = await Promise.all([
                User.find()
                    .skip(skip)
                    .limit(limit)
                    .select('-password')
                    .lean(),
                User.countDocuments()
            ]);


            ResponseHandler.success(res, users, 'Users retrieved successfully', 200, {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            });


        }
    );


    // get user by id
    public getUserById = expressAsyncHandler(
        async (req: AuthenticatedRequest, res: Response) => {
            const userId = req.params.id;

            const user = await User.findById(userId).select('-password').lean();

            if (!user) {
                throw new AppError('User not found', 404);
            }

            // task detaild of particualr user
            const taskStats = await Task.aggregate([
                { $match: { userId: user._id } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                    }
                }
            ]);

            const stats = taskStats[0] || { total: 0, completed: 0 };

            ResponseHandler.success(res, {
                user,
                taskStats: {
                    total: stats.total,
                    completed: stats.completed,
                }
            }, 'User retrieved successfully');
        }
    );


    // update user role by id
    public updateUserRole = expressAsyncHandler(
        async (req: AuthenticatedRequest, res: Response) => {
            const userId = req.params.id;
            const { role } = req.body;
            const validRoles = ['user', 'admin'];

            if (!validRoles.includes(role)) {
                throw new AppError('Invalid role', 400);
            }

            const user = await User.findById(userId);

            if (!user) {
                throw new AppError('User not found', 404);
            }

            if (user._id.toString() === req.user?.id && role === 'user') {
                throw new AppError('You cannot demote yourself', 400);
            }

            user.role = role;

            await user.save();

            ResponseHandler.success(res, {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }, 'User role updated successfully');
        }
    );


    // toogle user status
    public toggleUserStatus = expressAsyncHandler(
        async (req: AuthenticatedRequest, res: Response) => {
            const userId = req.params.id;
            const user = await User.findById(userId);

            if (!user) {
                throw new AppError('User not found', 404);
            }

            if (user._id.toString() === req.user?.id) {
                throw new AppError('You cannot change your own status', 400);
            }

            user.isActive = !user.isActive;

            await user.save();
            ResponseHandler.success(res, {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }, `User has been ${user.isActive ? 'activated' : 'deactivated'} successfully`);
        }
    );

    // delete user by id
    public deleteUser = expressAsyncHandler(
        async (req: AuthenticatedRequest, res: Response) => {
            const userId = req.params.id;

            const user = await User.findById(userId);

            if (!user) {
                throw new AppError('User not found', 404);
            }

            if (user._id.toString() === req.user?.id) {
                throw new AppError('You cannot delete yourself', 400);
            }

            await user.deleteOne();

            ResponseHandler.success(res, null, 'User deleted successfully');
        }
    );

    // system statustics 
    public getSystemStats = expressAsyncHandler(
        async (_req: AuthenticatedRequest, res: Response) => {
            const [userStats, taskStats] = await Promise.all([
                User.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalUsers: { $sum: 1 },
                            activeUsers: {
                                $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                            },
                            admins: {
                                $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
                            }
                        }
                    }
                ]),
                Task.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalTasks: { $sum: 1 },
                            completed: {
                                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                            },
                            pending: {
                                $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                            },
                            inProgress: {
                                $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
                            }
                        }
                    }
                ])
            ]);

            const users = userStats[0] || { totalUsers: 0, activeUsers: 0, admins: 0 };

            const tasks = taskStats[0] || { totalTasks: 0, completed: 0, pending: 0, inProgress: 0 };

            delete users._id;
            delete tasks._id;

            ResponseHandler.success(res, {
                users,
                tasks
            } , 'System statistics retrieved successfully');
        }
    );
}
import { NextFunction } from "express";
import { AppError } from "./AppError";

export enum Permission {
    // task realted permissions
    CREATE_TASK = 'create:task',
    READ_OWN_TASKS = 'read:own_tasks',
    READ_ALL_TASKS = 'read:all_tasks',
    UPDATE_OWN_TASKS = 'update:own_tasks',
    UPDATE_ALL_TASKS = 'update:all_tasks',
    DELETE_OWN_TASKS = 'delete:own_tasks',
    DELETE_ALL_TASKS = 'delete:all_tasks',

    // user related permissions
    READ_OWN_PROFILE = 'read:own_profile',
    READ_ALL_USERS = 'read:all_users',
    UPDATE_OWN_PROFILE = 'update:own_profile',
    UPDATE_ALL_USERS = 'update:all_users',
    DELETE_USERS = 'delete:users'
};

export const RolePermissions = {
    user: [
        Permission.CREATE_TASK,
        Permission.READ_OWN_TASKS,
        Permission.UPDATE_OWN_TASKS,
        Permission.DELETE_OWN_TASKS,
        Permission.READ_OWN_PROFILE,
        Permission.UPDATE_OWN_PROFILE
    ],
    admin: [
        Permission.CREATE_TASK,
        Permission.READ_OWN_TASKS,
        Permission.READ_ALL_TASKS,
        Permission.UPDATE_OWN_TASKS,
        Permission.UPDATE_ALL_TASKS,
        Permission.DELETE_OWN_TASKS,
        Permission.DELETE_ALL_TASKS,
        Permission.READ_OWN_PROFILE,
        Permission.READ_ALL_USERS,
        Permission.UPDATE_OWN_PROFILE,
        Permission.UPDATE_ALL_USERS,
        Permission.DELETE_USERS
    ]
};


export class PermissionChecker {
    public static hasPermission(userRole: string, permission: Permission): boolean {
        const permissions = RolePermissions[userRole as keyof typeof RolePermissions];
        return permissions.includes(permission);
    }

    public static requirePermission(permission: Permission) {
        return (req: any, res: Response, next: NextFunction) => {
            if (!req.user) {
                return next(new AppError('Authentication required', 401));
            }

            if (!this.hasPermission(req.user.role, permission)) {
                return next(new AppError('Insufficient permissions for this action', 403));
            }

            next();
        }
    }
}
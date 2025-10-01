import { Types } from "mongoose";


export interface ITask {
    _id: number;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
    userId: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};
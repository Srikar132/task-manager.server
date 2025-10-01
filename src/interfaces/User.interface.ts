

export interface IUser {
    _id: string;
    username: string;
    email: string;
    password: string;
    isActive: boolean;
    role : 'user' | 'admin';
    createdAt?: Date;
    updatedAt?: Date;
};

export interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateJWT(): string;
};

export type UserModel = IUser & IUserMethods;
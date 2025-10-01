import { Request, Response } from "express";
import AsyncHandler from "express-async-handler"
import { User } from "../models/User.model";
import { AppError } from "../utils/AppError";
import { JWTUtils } from "../utils/jwt";
import { ResponseHandler } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export class AuthController {
    public register = AsyncHandler(
        async (req: Request, res: Response) => {

            const {
                username,
                email,
                password
            } = req.body;

            const existingUser = await User.findOne({ email });

            if (existingUser) {
                throw new AppError('Email already in use', 400);
            }

            const newUser = new User({
                username,
                email,
                password,
                role: 'user' // default role
            });

            await newUser.save();

            const accessToken = JWTUtils.generateAccessToken(newUser);
            const refreshToken = JWTUtils.generateRefreshToken(newUser._id);

            ResponseHandler.created(res, {
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    isActive: newUser.isActive,
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            }, 'User registered successfully');
        }
    );

    public login = AsyncHandler(
        async (req: Request, res: Response) => {
            const { email, password } = req.body;

            const user = await User.findOne({ email }).select('+password');

            if (!user || !(await user.comparePassword(password))) {
                throw new AppError('Invalid email or password', 401);
            }

            if (!user.isActive) {
                throw new AppError('User account is inactive', 403);
            }

            // tokens
            const accessToken = JWTUtils.generateAccessToken(user);
            const refreshToken = JWTUtils.generateRefreshToken(user._id);

            ResponseHandler.success(res, {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            }, 'Login Successfull')
        }
    );

    public logout = AsyncHandler(
        async (_req: Request, res: Response) => {
            // need to black list token after some time
            ResponseHandler.success(res, null, 'Logout successful');
        }
    );

    public refreshToken = AsyncHandler(
        async (req: Request, res: Response) => {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                throw new AppError('Refresh token is required', 400);
            }

            const payload = JWTUtils.verifyRefreshToken(refreshToken);
            const user = await User.findById(payload.id);

            if (!user) {
                throw new AppError('User not found', 404);
            }

            // Generate new tokens
            const accessToken = JWTUtils.generateAccessToken(user);
            const newRefreshToken = JWTUtils.generateRefreshToken(user._id);

            ResponseHandler.success(res, {
                tokens: {
                    accessToken,
                    refreshToken: newRefreshToken
                }
            }, 'Token refreshed successfully');
        }
    );

    public getProfile = AsyncHandler(
        async (req: AuthenticatedRequest, res: Response) => {
            const user = await User.findById(req.user?.id);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            ResponseHandler.success(res, {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,  
                }
            }, 'User profile retrieved successfully');
        }
    );

    public changePassword = AsyncHandler(
        async (req : AuthenticatedRequest, res : Response) => {
            const { currentPassword, newPassword } = req.body;

            const user = await User.findById(req.user?.id).select('+password');
            if (!user) {
                throw new AppError('User not found', 404);
            }

            if (!await user.comparePassword(currentPassword)) {
                throw new AppError('Current password is incorrect', 401);
            }

            user.password = newPassword;
            await user.save();

            ResponseHandler.success(res, null, 'Password changed successfully');
        }
    );
}
import jwt from 'jsonwebtoken';
import { IUser } from '../interfaces/User.interface';
import { configDotenv } from 'dotenv';

configDotenv();


export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}


export class JWTUtils {
  private static readonly SECRET = process.env.JWT_SECRET as string;
  private static readonly EXPIRE = process.env.JWT_EXPIRE || '24h';
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
  private static readonly REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

  
  public static generateAccessToken(user: Partial<IUser>): string {

    if (!this.SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      this.SECRET,
      {
        expiresIn: this.EXPIRE as any,
        issuer: 'task-manager-api',
        audience: 'task-manager-users'
      }
    );
  }

  public static generateRefreshToken(userId: string): string {
    if (!this.REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }

    return jwt.sign(
      { id: userId },
      this.REFRESH_SECRET,
      {
        expiresIn: this.REFRESH_EXPIRE as any,
        issuer: 'task-manager-api',
        audience: 'task-manager-users'
      }
    );
  }

  public static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.SECRET) as JWTPayload;
    } catch (error: any) {
      throw new Error(`Invalid access token: ${error.message}`);
    }
  }

  public static verifyRefreshToken(token: string): { id: string } {
    try {
      return jwt.verify(token, this.REFRESH_SECRET) as { id: string };
    } catch (error: any) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }
}
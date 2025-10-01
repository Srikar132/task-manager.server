

import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}



export class ResponseHandler {
  public static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta })
    };
    return res.status(statusCode).json(response);
  }

  public static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  public static noContent(res: Response): Response {
    return res.status(204).send();
  }

  public static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    details?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        message,
        ...(details && { details })
      }
    };
    return res.status(statusCode).json(response);
  }
}
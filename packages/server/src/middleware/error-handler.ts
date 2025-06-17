import { Request, Response, NextFunction } from 'express';
import { Logger } from '@xiaohongshu/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(logger: Logger) {
  return (error: AppError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = error.statusCode || 500;
    const isOperational = error.isOperational || false;

    // 记录错误日志
    if (statusCode >= 500) {
      logger.error('服务器内部错误', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
    } else {
      logger.warn('客户端错误', {
        error: error.message,
        path: req.path,
        method: req.method,
        statusCode,
      });
    }

    // 返回错误响应
    const response = {
      success: false,
      error: isOperational ? error.message : '服务器内部错误',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error,
      }),
    };

    res.status(statusCode).json(response);
  };
}

export function createError(message: string, statusCode = 500, isOperational = true): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
} 
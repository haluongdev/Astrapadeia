import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { env } from '../config/env.js';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Known AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code || 'APP_ERROR',
    });
    return;
  }

  // 2. Zod Validation Error
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Dữ liệu yêu cầu không hợp lệ',
      code: 'VALIDATION_ERROR',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // 3. PostgreSQL Duplicate Key Error
  if (err?.code === '23505') {
    res.status(409).json({
      error: 'Dữ liệu đã tồn tại trong hệ thống (email hoặc số điện thoại trùng lặp)',
      code: 'CONFLICT',
    });
    return;
  }

  // 4. Malformed JSON Request
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'Định dạng dữ liệu JSON không hợp lệ',
      code: 'BAD_REQUEST',
    });
    return;
  }

  // 5. Unexpected Internal Server Error
  if (env.NODE_ENV !== 'test') {
    console.error('❌ [Unhandled Server Error]:', err);
  }

  res.status(500).json({
    error: 'Lỗi máy chủ nội bộ, vui lòng thử lại sau',
    code: 'INTERNAL_SERVER_ERROR',
    ...(env.NODE_ENV === 'development' ? { message: err?.message, stack: err?.stack } : {}),
  });
}

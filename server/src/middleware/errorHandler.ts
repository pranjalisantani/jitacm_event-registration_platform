import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'APPLICATION_ERROR',
    public details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Request input validation failed.',
      errors: err.flatten().fieldErrors,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 2. Custom Application Error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 3. PostgreSQL Specific Error Codes
  const pgErr = err as { code?: string; detail?: string };
  if (pgErr.code === '23505') {
    // Unique violation
    res.status(409).json({
      success: false,
      code: 'DUPLICATE_RESOURCE',
      message: 'A resource with this identifier already exists.',
      detail: pgErr.detail,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (pgErr.code === '23514') {
    // Check constraint violation
    res.status(400).json({
      success: false,
      code: 'CONSTRAINT_VIOLATION',
      message: 'Database check constraint violated (e.g. capacity limits exceeded).',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 4. Unhandled Internal Server Error
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected internal server error occurred.',
    timestamp: new Date().toISOString(),
  });
}

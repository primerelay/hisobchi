import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: config.env === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validatsiya xatosi',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validatsiya xatosi',
      message: err.message,
    });
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return res.status(409).json({
      error: 'Bu ma\'lumot allaqachon mavjud',
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Noto\'g\'ri ID formati',
    });
  }

  // Custom operational errors
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      error: err.message,
    });
  }

  // Unknown errors
  return res.status(500).json({
    error: config.env === 'development' ? err.message : 'Server xatosi',
  });
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    error: `Yo'l topilmadi: ${req.method} ${req.path}`,
  });
}

export class ApiError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

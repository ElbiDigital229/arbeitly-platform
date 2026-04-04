import { AppError } from './AppError.js';

export class HttpError {
  static notFound(message = 'Not found'): AppError {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static badRequest(message = 'Bad request'): AppError {
    return new AppError(message, 400, 'BAD_REQUEST');
  }

  static conflict(message = 'Conflict'): AppError {
    return new AppError(message, 409, 'CONFLICT');
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

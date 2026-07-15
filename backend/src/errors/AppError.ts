export class AppError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static BadRequest(message: string, details?: any) {
    return new AppError(message, 400, details);
  }

  static Unauthorized(message: string = 'Unauthorized') {
    return new AppError(message, 401);
  }

  static Forbidden(message: string = 'Forbidden') {
    return new AppError(message, 403);
  }

  static NotFound(message: string = 'Not Found') {
    return new AppError(message, 404);
  }

  static Internal(message: string = 'Internal Server Error') {
    return new AppError(message, 500);
  }
}

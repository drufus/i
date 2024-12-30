// Custom error classes for better error handling
export class AppError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class StripeError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code);
  }
}
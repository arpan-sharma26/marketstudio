/**
 * Structured application errors. These carry a stable `code` and a user-safe `message`.
 * Technical details are logged server-side; they are never leaked to the client.
 */

export type AppErrorCode =
  | "unauthenticated"
  | "forbidden"
  | "validation"
  | "not_found"
  | "conflict"
  | "internal";

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export class AuthError extends AppError {
  constructor(message = "You must be signed in to continue.") {
    super("unauthenticated", message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this resource.") {
    super("forbidden", message);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends AppError {
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    message = "The submitted data is invalid.",
    fieldErrors: Record<string, string[]> = {},
  ) {
    super("validation", message);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "The requested resource was not found.") {
    super("not_found", message);
    this.name = "NotFoundError";
  }
}

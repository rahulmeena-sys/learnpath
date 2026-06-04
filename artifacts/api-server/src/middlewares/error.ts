import type { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "../lib/logger";
import { config } from "../lib/config";

/**
 * An error with an associated HTTP status. Throw this from route handlers to
 * return a controlled error response, e.g. `throw new AppError(404, "Not found")`.
 */
export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Wrap an async route handler so rejected promises are forwarded to the error
 * handler. Express 5 forwards async rejections automatically, but this keeps
 * intent explicit and is safe to use everywhere.
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/** 404 handler for unmatched routes. Register after all routes. */
export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Not found", code: "NOT_FOUND" });
};

/**
 * Central error handler. Returns a consistent `{ error, code }` shape (the
 * existing routes already use `{ error: string }`, so this stays compatible).
 * Register last, after routes and notFound.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : undefined;

  // Log full detail server-side; never leak internals on 5xx responses.
  const log = req.log ?? logger;
  if (status >= 500) {
    log.error({ err }, "Unhandled error");
  } else {
    log.warn({ err: { message: err?.message }, status }, "Request error");
  }

  if (res.headersSent) return;

  const message =
    status >= 500 && config.isProduction
      ? "Internal server error"
      : (err?.message ?? "Internal server error");

  res.status(status).json({ error: message, ...(code ? { code } : {}) });
};

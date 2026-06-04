import type { RequestHandler } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { User } from "@workspace/db";
import { config } from "../lib/config";
import { AppError } from "./error";
import { getOrCreateUserByAuth } from "../routes/helpers";

// Augment Express Request with the authenticated identity.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: number;
      appUser?: User;
    }
  }
}

// Build the remote key set once. `jose` caches keys and refreshes on rotation,
// so verification is local (stateless) with no per-request network call.
const jwks = config.supabaseAuth
  ? createRemoteJWKSet(new URL(config.supabaseAuth.jwksUrl))
  : null;

function bearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

/**
 * Verifies the Supabase access token on the Authorization header, provisions /
 * loads the app user, and attaches `req.userId` + `req.appUser`. Throws 401 on
 * any failure. Mount before all protected routers.
 */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    if (!jwks || !config.supabaseAuth) {
      throw new AppError(503, "Auth is not configured (SUPABASE_URL missing).");
    }

    const token = bearerToken(req.headers.authorization);
    if (!token) throw new AppError(401, "Missing bearer token");

    const { payload } = await jwtVerify(token, jwks, {
      issuer: config.supabaseAuth.issuer,
    });

    const authId = payload.sub;
    if (!authId) throw new AppError(401, "Token has no subject");

    const email = typeof payload.email === "string" ? payload.email : null;
    const user = await getOrCreateUserByAuth(authId, email);

    req.userId = user.id;
    req.appUser = user;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(401, "Invalid or expired token"));
  }
};

/**
 * Restricts a route to admins (email in ADMIN_EMAILS). Mount AFTER requireAuth.
 */
export const requireAdmin: RequestHandler = (req, _res, next) => {
  const email = req.appUser?.email?.toLowerCase();
  if (!email || !config.adminEmails.includes(email)) {
    return next(new AppError(403, "Admin access required"));
  }
  next();
};

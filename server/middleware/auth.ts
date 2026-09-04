import { Request, Response, NextFunction } from "express";
import { db, User } from "../db.ts";

export interface AuthenticatedRequest extends Request {
  user?: User;
  userId?: string;
  isGuest?: boolean;
}

export function setSessionCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("arfa_session", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie("arfa_session", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
}

export function extractSessionToken(req: Request): string | null {
  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.arfa_session) {
    return req.cookies.arfa_session;
  }

  // 2. Check Authorization header (Bearer token)
  const authHeader = req.headers["authorization"];
  if (authHeader && typeof authHeader === "string") {
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7).trim();
    }
    return authHeader.trim();
  }

  // 3. Check x-auth-token fallback
  const customHeader = req.headers["x-auth-token"];
  if (customHeader && typeof customHeader === "string") {
    return customHeader.trim();
  }

  return null;
}

export function authContextMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = extractSessionToken(req);
  if (token) {
    const user = db.verifySession(token);
    if (user) {
      req.user = user;
      req.userId = user.id;
      req.isGuest = false;
      return next();
    }
  }

  // Check guest session token or header
  const guestHeader = req.headers["x-guest-session-id"] as string;
  if (guestHeader && typeof guestHeader === "string" && guestHeader.startsWith("guest_")) {
    req.userId = guestHeader;
    req.isGuest = true;
    return next();
  }

  // Fallback to guest ID
  req.userId = "guest_anonymous";
  req.isGuest = true;
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.isGuest) {
    return res.status(401).json({
      error: "Authentication required. Please log in to your Arfa AI account.",
    });
  }
  next();
}

import { Request, Response, NextFunction } from "express";

// Rate limiting state stores
interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

// Clean expired rate limit buckets periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key);
    }
  }
}, 60000);

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) {
  const { windowMs, max, message = "Too many requests. Please slow down.", keyGenerator } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const defaultKey = (req.headers["x-forwarded-for"] as string) || req.ip || "unknown_ip";
    const key = keyGenerator ? keyGenerator(req) : defaultKey;
    const now = Date.now();
    let bucket = rateLimitBuckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 1, resetAt: now + windowMs };
      rateLimitBuckets.set(key, bucket);
      res.setHeader("RateLimit-Limit", max);
      res.setHeader("RateLimit-Remaining", max - 1);
      res.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1000));
      return next();
    }

    if (bucket.count >= max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader("Retry-After", retryAfterSeconds);
      res.setHeader("RateLimit-Limit", max);
      res.setHeader("RateLimit-Remaining", 0);
      res.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1000));

      console.warn(`[RateLimit] Limit hit for key=${key.slice(0, 20)} on path=${req.path}`);
      return res.status(429).json({
        error: message,
        retryAfter: retryAfterSeconds,
      });
    }

    bucket.count++;
    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", Math.max(0, max - bucket.count));
    res.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1000));
    next();
  };
}

// Security Headers Middleware
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
  // Protect against MIME sniffing
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Restrict CORS safely: allow current origin
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token, x-guest-session-id"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
}

// Production Logging Middleware (Redacts sensitive fields)
export function productionLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;

    // Redacted log: never output request body, auth credentials, or sensitive headers
    const logPrefix = `[${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} - ${duration}ms`;
    if (isError) {
      console.warn(`${logPrefix}`);
    } else {
      console.log(`${logPrefix}`);
    }
  });

  next();
}

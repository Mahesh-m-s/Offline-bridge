/**
 * In-Memory Sliding Window Rate Limiter
 * Provides DDoS / Brute-Force protection on sensitive endpoints (Auth, Sync, Ingestion)
 */

export function createRateLimiter({
  windowMs = 15 * 60 * 1000, // 15 minutes default
  maxRequests = 50,
  message = 'Too many requests from this IP address. Please try again later.',
  code = 'RATE_LIMIT_EXCEEDED'
} = {}) {
  // Store: Map<string, Array<number>> (IP -> timestamps)
  const hits = new Map();

  // Periodic cleanup every 5 minutes to avoid memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of hits.entries()) {
      const active = timestamps.filter((t) => now - t < windowMs);
      if (active.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, active);
      }
    }
  }, 5 * 60 * 1000);
  cleanupInterval.unref();

  return (req, res, next) => {
    // Key by authenticated user ID if present, otherwise IP
    const clientKey = req.user?.id || req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const userHits = hits.get(clientKey) || [];
    const recentHits = userHits.filter((t) => now - t < windowMs);

    if (recentHits.length >= maxRequests) {
      const oldestHit = recentHits[0];
      const resetTimeSeconds = Math.ceil((oldestHit + windowMs - now) / 1000);

      res.setHeader('Retry-After', resetTimeSeconds);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil((oldestHit + windowMs) / 1000));

      return res.status(429).json({
        success: false,
        error: {
          message,
          code,
          retryAfterSeconds: resetTimeSeconds
        }
      });
    }

    recentHits.push(now);
    hits.set(clientKey, recentHits);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - recentHits.length));

    next();
  };
}

// Pre-configured rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20, // 20 attempts per 15 minutes
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
});

export const syncRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 60, // 60 sync operations per 5 minutes
  message: 'Too many sync requests. Please throttle background synchronization.'
});

export const trackingRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 30, // 30 status tracking queries per 5 minutes per client
  message: 'Too many status tracking requests from this client. Please wait a moment before trying again.',
  code: 'TRACKING_RATE_LIMIT_EXCEEDED'
});


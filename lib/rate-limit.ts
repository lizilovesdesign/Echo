interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

const cache = new Map<string, { count: number; resetTime: number }>();

export function isRateLimited(key: string, options: RateLimitOptions): boolean {
  const now = Date.now();
  const cached = cache.get(key);

  if (!cached) {
    cache.set(key, { count: 1, resetTime: now + options.windowMs });
    return false;
  }

  if (now > cached.resetTime) {
    // Reset window
    cache.set(key, { count: 1, resetTime: now + options.windowMs });
    return false;
  }

  cached.count += 1;
  if (cached.count > options.limit) {
    return true;
  }

  return false;
}

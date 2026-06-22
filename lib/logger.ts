type LogMeta = Record<string, unknown>;

const SENSITIVE_FIELDS = new Set([
  'note',
  'noteText',
  'password',
  'token',
  'authorization',
  'accessToken',
  'refreshToken',
  'moodTag',
  'mood',
]);

function sanitizeMeta(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Error) {
    return {
      message: obj.message,
      name: obj.name,
      stack: process.env.NODE_ENV !== 'production' ? obj.stack : undefined,
    };
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeMeta);
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      if (SENSITIVE_FIELDS.has(key)) {
        sanitized[key] = '[SCRUBBED]';
      } else {
        sanitized[key] = sanitizeMeta((obj as Record<string, unknown>)[key]);
      }
    }
    return sanitized;
  }
  return obj;
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.log(
      JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        message,
        meta: meta ? sanitizeMeta(meta) : undefined,
      })
    );
  },
  warn(message: string, meta?: LogMeta) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        timestamp: new Date().toISOString(),
        message,
        meta: meta ? sanitizeMeta(meta) : undefined,
      })
    );
  },
  error(message: string, meta?: LogMeta) {
    console.error(
      JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        message,
        meta: meta ? sanitizeMeta(meta) : undefined,
      })
    );
  },
};

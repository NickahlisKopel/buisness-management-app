// Simple in-memory rate limiter for production
// For scale, use Redis-backed solution like @upstash/ratelimit

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export const rateLimitConfigs = {
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  strict: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute for sensitive ops
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const key = identifier
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    const resetAt = now + config.windowMs
    rateLimitStore.set(key, { count: 1, resetAt })
    return { success: true, remaining: config.maxRequests - 1, resetAt }
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)
  return { success: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt }
}

export function getRateLimitIdentifier(request: Request): string {
  // Try to get real IP from headers (Vercel sets x-forwarded-for)
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return ip
}

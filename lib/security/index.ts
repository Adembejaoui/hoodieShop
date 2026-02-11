/**
 * Security Utilities Index
 * 
 * Centralized exports for all security utilities
 */

// Rate Limiting
export {
  rateLimits,
  applyRateLimit,
  getClientIP,
  createRateLimitResponse,
  withRateLimit,
  type RateLimitResult,
} from './rate-limit';

// Authorization
export {
  requireAuth,
  requireAdmin,
  requireRole,
  getOptionalAuth,
  checkIsBlocked,
  type UserRole,
} from './authorization';

// Price Validation
export {
  validateAndCalculatePrices,
  validateCoupon,
  validateShippingCost,
  calculateTotalPrice,
} from './price-validation';

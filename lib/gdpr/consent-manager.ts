// Cookie consent types
export type ConsentCategory = 'necessary' | 'analytics' | 'marketing';

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

export const CONSENT_VERSION = '1.0.0';

// Default consent values
export const defaultConsent: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: '',
  version: CONSENT_VERSION,
};

// Cookie name for storing consent
export const CONSENT_COOKIE_NAME = 'gdpr_consent';

// Cookie options
export const cookieOptions = {
  maxAge: 365 * 24 * 60 * 60, // 1 year
  path: '/',
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
};

// Simple XOR obfuscation key (shared secret for obscurity)
const OBFUSCATION_KEY = 'hoodie-legends-gdpr-2024';

/**
 * Export obfuscation utilities for other cookies
 */
export const cookieUtils = {
  obfuscate,
  deobfuscate,
  setCookie: (name: string, value: string, options: typeof cookieOptions) => {
    const obfuscated = obfuscate(value);
    document.cookie = `${name}=${encodeURIComponent(obfuscated)}; max-age=${options.maxAge}; path=${options.path}; samesite=${options.sameSite}; ${options.secure ? 'secure' : ''}`;
  },
  getCookie: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, ...valueParts] = cookie.trim().split('=');
      if (cookieName === name) {
        const encodedValue = valueParts.join('=');
        try {
          return deobfuscate(decodeURIComponent(encodedValue));
        } catch {
          return null;
        }
      }
    }
    return null;
  },
  clearCookie: (name: string, path: string = '/') => {
    document.cookie = `${name}=; max-age=0; path=${path}`;
  },
};

/**
 * Simple XOR obfuscation for cookie values
 * Provides tampering resistance without async complexity
 */
function obfuscate(value: string): string {
  let result = '';
  for (let i = 0; i < value.length; i++) {
    result += String.fromCharCode(
      value.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length)
    );
  }
  return btoa(result);
}

/**
 * Deobfuscate cookie value
 */
function deobfuscate(encoded: string): string {
  try {
    const value = atob(encoded);
    let result = '';
    for (let i = 0; i < value.length; i++) {
      result += String.fromCharCode(
        value.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length)
      );
    }
    return result;
  } catch {
    return '';
  }
}

/**
 * Validate checksum to detect tampering
 */
function validateChecksum(value: string, checksum: string): boolean {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36) === checksum;
}

// Create consent cookie with obfuscation
export function setConsentCookie(preferences: ConsentPreferences): void {
  const value = JSON.stringify(preferences);
  const obfuscated = obfuscate(value);
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(obfuscated)}; max-age=${cookieOptions.maxAge}; path=${cookieOptions.path}; samesite=${cookieOptions.sameSite}; ${cookieOptions.secure ? 'secure' : ''}`;
}

// Get consent from cookie with deobfuscation
export function getConsentCookie(): ConsentPreferences | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name === CONSENT_COOKIE_NAME) {
      const encodedValue = valueParts.join('=');
      
      // Try obfuscated format first (new)
      try {
        const decrypted = deobfuscate(decodeURIComponent(encodedValue));
        if (decrypted) {
          return JSON.parse(decrypted);
        }
      } catch {
        // Continue to plain JSON fallback
      }
      
      // Fallback to plain JSON (backward compatibility)
      try {
        return JSON.parse(decodeURIComponent(encodedValue));
      } catch {
        return null;
      }
    }
  }
  return null;
}

// Check if consent was given
export function hasConsent(): boolean {
  const consent = getConsentCookie();
  return consent !== null && consent.version === CONSENT_VERSION;
}

// Check specific category consent
export function hasCategoryConsent(category: ConsentCategory): boolean {
  const consent = getConsentCookie();
  if (!consent) return category === 'necessary';
  return consent[category] ?? false;
}

// Clear consent cookie
export function clearConsentCookie(): void {
  document.cookie = `${CONSENT_COOKIE_NAME}=; max-age=0; path=/`;
}

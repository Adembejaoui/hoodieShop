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

// Create consent cookie
export function setConsentCookie(preferences: ConsentPreferences): void {
  // Use document.cookie for better compatibility
  const value = JSON.stringify(preferences);
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}; max-age=${cookieOptions.maxAge}; path=${cookieOptions.path}; samesite=${cookieOptions.sameSite}; ${cookieOptions.secure ? 'secure' : ''}`;
}

// Get consent from cookie
export function getConsentCookie(): ConsentPreferences | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CONSENT_COOKIE_NAME) {
      try {
        return JSON.parse(decodeURIComponent(value));
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

/**
 * Central configuration for the application
 * Use this to ensure consistent values across the codebase
 */

/**
 * The base URL for the application
 * Used for SEO metadata, sitemaps, and structured data
 */
export const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.hoodiz.net';

/**
 * Supported locales for the application
 */
export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

/**
 * Default locale
 */
export const defaultLocale: Locale = 'en';

/**
 * Logo URL for the application
 */
export const logoUrl = 'https://bhxnlnpksfyqrvojlsfi.supabase.co/storage/v1/object/public/images/logoHoodiz.jpeg';

/**
 * Default OpenGraph image
 */
export const defaultOgImage = `${baseUrl}/images/og-image.jpg`;

/**
 * Business information
 * Update these values with actual business details
 */
export const businessInfo = {
  name: 'Hoodiz Tunisia',
  description: 'Premium anime hoodies and streetwear for the culture.',
  email: 'support@hoodiz.net',
  phone: '+216 58 886 673', // Update with actual Tunisian phone number
  address: {
    street: 'Rue Montfleury',
    city: 'Tunis',
    postalCode: '1000',
    country: 'Tunisia',
    countryCode: 'TN',
  },
  currency: 'TND', // Tunisian Dinar
  currencySymbol: 'DT', // Display symbol for Tunisian Dinar
  priceRange: '$$',
  socialLinks: {
    facebook: 'https://facebook.com/hoodiztn',
    twitter: 'https://twitter.com/hoodiztn',
    instagram: 'https://instagram.com/hoodiztn',
  },
};

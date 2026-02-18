# i18n Migration Plan

## Overview
This plan outlines the complete migration of the Hoodies e-commerce application to support internationalization (i18n) using `next-intl`. The goal is to move all pages into the `[lang]` folder structure and replace all hardcoded text with translation keys.

## Current State Analysis

### Already Implemented
- `next-intl` package installed
- i18n configuration files created (`i18n/request.ts`, `i18n/routing.ts`)
- Root layout restructured to return children only
- `[lang]` layout with `NextIntlClientProvider`
- English translations file (`translations/en.json`)
- Some components already use `useTranslations`:
  - `header.tsx`
  - `footer.tsx`
  - `hero-section.tsx`
  - `benefits-section.tsx`
  - `categories-section.tsx`
  - `featured-products.tsx`

### Issues to Fix
1. **Missing French translations** - `translations/fr.json` does not exist
2. **Duplicate pages** - Pages exist both in root and `[lang]` folder
3. **Hardcoded text** - Many pages still have hardcoded English text
4. **Middleware issues** - Path matching uses `.includes()` which is imprecise
5. **Inconsistent Link usage** - Some components use `next/link` instead of i18n `Link`

---

## Phase 1: Core Infrastructure

### 1.1 Create French Translations File
Create `translations/fr.json` with all keys from `en.json` translated to French.

### 1.2 Update English Translations
Add missing translation keys for pages that need migration:
- About page content
- Contact page content
- Auth page content
- Cart page content
- Checkout page content
- Shop page content
- Privacy page content
- Terms page content
- Blocked page content
- Dashboard pages content
- Product pages content

### 1.3 Fix Middleware Path Matching
Update `middleware.ts` to use precise path matching:
```typescript
// Before
if (pathname.includes("/admin") && token?.role !== "ADMIN")

// After
if ((pathname.startsWith("/admin") || pathname.match(/^\/(en|fr)\/admin/)) && token?.role !== "ADMIN")
```

### 1.4 Fix Hero Section Link
Update `components/home/hero-section.tsx` to use i18n `Link`:
```typescript
// Before
import Link from 'next/link'
<Link href={getLocalizedPath('/shop')}>

// After
import { Link } from '@/i18n/routing'
<Link href="/shop">
```

---

## Phase 2: Migrate Pages to [lang] Folder

### Page Migration Strategy
For each page, the migration involves:
1. Move the page file to `app/[lang]/<path>/page.tsx`
2. Add `setRequestLocale` for static generation
3. Replace `next/link` imports with `@/i18n/routing` Link
4. Replace hardcoded text with `useTranslations` calls
5. Update any redirect URLs to include locale

### Pages to Migrate

| Current Path | Target Path | Status |
|--------------|-------------|--------|
| `app/page.tsx` | Already in `[lang]` | Done |
| `app/about/page.tsx` | `app/[lang]/about/page.tsx` | Pending |
| `app/contact/page.tsx` | `app/[lang]/contact/page.tsx` | Pending |
| `app/auth/page.tsx` | `app/[lang]/auth/page.tsx` | Pending |
| `app/cart/page.tsx` | `app/[lang]/cart/page.tsx` | Pending |
| `app/checkout/page.tsx` | `app/[lang]/checkout/page.tsx` | Pending |
| `app/shop/page.tsx` | `app/[lang]/shop/page.tsx` | Pending |
| `app/privacy/page.tsx` | `app/[lang]/privacy/page.tsx` | Pending |
| `app/terms/page.tsx` | `app/[lang]/terms/page.tsx` | Pending |
| `app/blocked/page.tsx` | `app/[lang]/blocked/page.tsx` | Pending |
| `app/dashboard/*` | `app/[lang]/dashboard/*` | Pending |
| `app/data-export/page.tsx` | `app/[lang]/data-export/page.tsx` | Pending |
| `app/data-deletion/page.tsx` | `app/[lang]/data-deletion/page.tsx` | Pending |
| `app/product/[categorySlug]/[productSlug]/page.tsx` | `app/[lang]/product/[categorySlug]/[productSlug]/page.tsx` | Pending |
| `app/admin/*` | `app/[lang]/admin/*` | Pending |

---

## Phase 3: Add useTranslations to All Pages

### Translation Keys Structure

```json
{
  "about": {
    "badge": "Our Story",
    "titleLine1": "Born from Passion,",
    "titleLine2": "Made for Fans",
    "description": "...",
    "exploreCollection": "Explore Collection",
    "getInTouch": "Get in Touch",
    "mission": {
      "badge": "Our Mission",
      "title": "Connecting Fans Through Fashion",
      "paragraph1": "...",
      "paragraph2": "..."
    },
    "stats": {
      "happyCustomers": "Happy Customers",
      "uniqueDesigns": "Unique Designs",
      "animeSeries": "Anime Series",
      "satisfaction": "Satisfaction"
    }
  },
  "contact": {
    "badge": "Get in Touch",
    "title": "We would love to hear from you",
    "description": "...",
    "info": {
      "email": {
        "title": "Email Us",
        "value": "support@hoodielegends.com",
        "note": "We reply within 24 hours"
      },
      "phone": {
        "title": "Call Us",
        "value": "+1 (555) 123-4567",
        "note": "Mon-Fri 9AM-6PM EST"
      }
    }
  }
}
```

### Implementation Pattern

For client components:
```typescript
'use client'

import { useTranslations } from 'next-intl'

export default function Page() {
  const t = useTranslations('pageNamespace')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}
```

For server components:
```typescript
import { getTranslations, setRequestLocale } from 'next-intl/server'

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  setRequestLocale(lang)
  const t = await getTranslations('pageNamespace')
  
  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  )
}
```

---

## Phase 4: Update Components with Translations

### Components to Update

| Component | Current State | Action Needed |
|-----------|---------------|---------------|
| `login-form.tsx` | Hardcoded text | Add translations |
| `register-form.tsx` | Hardcoded text | Add translations |
| `product-card.tsx` | Partially translated | Complete translations |
| `mini-cart.tsx` | Hardcoded text | Add translations |
| `add-to-cart-button.tsx` | Hardcoded text | Add translations |
| `cookie-consent-banner.tsx` | Hardcoded text | Add translations |
| `autocomplete-input.tsx` | Hardcoded text | Add translations |

---

## Phase 5: Clean Up and Remove Old Files

### Tasks
1. Remove old page files outside `[lang]` folder
2. Update any remaining hardcoded routes in components
3. Update sitemap.ts to generate locale-aware URLs
4. Update robots.ts if needed
5. Test all routes work with locale prefix

### Files to Remove After Migration
- `app/page.tsx` (duplicate of `app/[lang]/page.tsx`)
- `app/about/page.tsx`
- `app/contact/page.tsx`
- `app/auth/page.tsx`
- `app/cart/page.tsx`
- `app/checkout/page.tsx`
- `app/shop/page.tsx`
- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- `app/blocked/page.tsx`
- `app/dashboard/` (entire folder)
- `app/data-export/`
- `app/data-deletion/`
- `app/product/`
- `app/admin/` (entire folder)

---

## Architecture Diagram

```mermaid
graph TD
    subgraph Request Flow
        A[User Request] --> B[Middleware]
        B --> C{Locale in URL?}
        C -->|Yes| D[Continue to Page]
        C -->|No| E[Redirect with Locale]
        E --> D
        D --> F[Layout with NextIntlClientProvider]
        F --> G[Page Component]
        G --> H[useTranslations Hook]
        H --> I[Translation JSON]
    end

    subgraph File Structure
        J[app/] --> K[layout.tsx - Root]
        J --> L[[lang]/]
        L --> M[layout.tsx - Locale Provider]
        L --> N[page.tsx - Home]
        L --> O[about/page.tsx]
        L --> P[contact/page.tsx]
        L --> Q[shop/page.tsx]
        L --> R[auth/page.tsx]
        L --> S[dashboard/]
        L --> T[admin/]
    end

    subgraph i18n Config
        U[i18n/routing.ts] --> V[Locale Definitions]
        U --> W[Navigation Helpers]
        X[i18n/request.ts] --> Y[Message Loading]
        Y --> Z[translations/en.json]
        Y --> AA[translations/fr.json]
    end
```

---

## Testing Checklist

### Route Testing
- [ ] `/en` - English home page
- [ ] `/fr` - French home page
- [ ] `/en/shop` - English shop
- [ ] `/fr/shop` - French shop
- [ ] `/en/about` - English about
- [ ] `/fr/about` - French about
- [ ] `/en/contact` - English contact
- [ ] `/fr/contact` - French contact
- [ ] `/en/auth` - English auth
- [ ] `/fr/auth` - French auth
- [ ] `/en/cart` - English cart
- [ ] `/fr/cart` - French cart
- [ ] `/en/checkout` - English checkout
- [ ] `/fr/checkout` - French checkout
- [ ] `/en/dashboard` - English dashboard
- [ ] `/fr/dashboard` - French dashboard
- [ ] `/en/admin/dashboard` - English admin
- [ ] `/fr/admin/dashboard` - French admin

### Functionality Testing
- [ ] Language switcher works
- [ ] Navigation links preserve locale
- [ ] Auth redirects preserve locale
- [ ] API routes work correctly
- [ ] Static generation works for all locales
- [ ] Middleware correctly protects routes

---

## Estimated Scope

| Phase | Files to Modify | Files to Create |
|-------|-----------------|-----------------|
| Phase 1 | 3 | 1 |
| Phase 2 | 15+ | 0 |
| Phase 3 | 15+ | 0 |
| Phase 4 | 7 | 0 |
| Phase 5 | 2 | 0 |

**Total Estimated Files to Modify:** 40+
**Total Estimated Files to Create:** 1 (fr.json)

---

## Notes

1. **API Routes**: API routes should remain at `app/api/` level, not moved to `[lang]/api/` since they don't need locale context.

2. **Admin Routes**: Admin routes should also be moved to `[lang]/admin/` for consistency, though the admin panel may only need English initially.

3. **Static Generation**: Use `generateStaticParams` in each page to enable static generation for all locales.

4. **SEO**: Update sitemap.ts to generate URLs for all locales with proper hreflang tags.
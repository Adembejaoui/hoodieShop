# Dark Theme Conversion Plan

## Overview

This plan outlines the conversion of the current purple/pink anime-style theme to a clean dark theme using zinc/white colors. The conversion affects 25+ component files and requires systematic updates to maintain visual consistency.

## Current Theme Analysis

### Current Color Palette (Purple/Pink)
- **Primary Background**: `from-purple-950 via-purple-900 to-black`
- **Orbs/Glows**: `bg-purple-600/20`, `bg-pink-600/20`
- **Buttons**: `from-purple-600 to-pink-600`
- **Text Gradients**: `from-purple-400 via-pink-400 to-purple-400`
- **Borders**: `border-purple-500/30`
- **Card Backgrounds**: `bg-purple-900/50`

### Target Color Palette (Dark Zinc)
| Element | Current | Target |
|---------|---------|--------|
| Background Primary | `purple-950` | `zinc-950` (#09090b) |
| Background Secondary | `purple-900` | `zinc-900` (#18181b) |
| Background Tertiary | `purple-800` | `zinc-800` (#27272a) |
| Border | `purple-500/30` | `zinc-700/50` or `white/10` |
| Border Light | `purple-500/50` | `zinc-600` or `white/20` |
| Text Primary | `white` | `white` |
| Text Secondary | `purple-200` | `zinc-300` (#d4d4d8) |
| Text Muted | `purple-300/70` | `zinc-400` (#a1a1aa) |
| Accent Primary | `purple-600` | `white` |
| Accent Secondary | `pink-600` | `zinc-200` |
| Glow/Orbs | `purple-600/20` | `white/5` or `zinc-500/10` |

## Files Requiring Changes

### 1. Global Styles
- [`app/globals.css`](app/globals.css) - CSS variables and animations

### 2. Hero Components (4 files)
- [`components/home/hero-variants/hero-variant-1.tsx`](components/home/hero-variants/hero-variant-1.tsx)
- [`components/home/hero-variants/hero-variant-2.tsx`](components/home/hero-variants/hero-variant-2.tsx)
- [`components/home/hero-variants/hero-variant-3.tsx`](components/home/hero-variants/hero-variant-3.tsx)
- [`components/home/hero-section.tsx`](components/home/hero-section.tsx)

### 3. Layout Components (3 files)
- [`components/layout/header.tsx`](components/layout/header.tsx)
- [`components/layout/footer.tsx`](components/layout/footer.tsx)
- [`components/layout/language-switcher.tsx`](components/layout/language-switcher.tsx)

### 4. Home Page Sections (3 files)
- [`components/home/benefits-section.tsx`](components/home/benefits-section.tsx)
- [`components/home/categories-section.tsx`](components/home/categories-section.tsx)
- [`components/home/featured-products.tsx`](components/home/featured-products.tsx)

### 5. Auth Components (3 files)
- [`components/login-form.tsx`](components/login-form.tsx)
- [`components/register-form.tsx`](components/register-form.tsx)
- [`components/welcome-popup.tsx`](components/welcome-popup.tsx)

### 6. UI Components (2 files)
- [`components/ui/hoodiz-logo.tsx`](components/ui/hoodiz-logo.tsx)
- [`components/privacy/cookie-consent-banner.tsx`](components/privacy/cookie-consent-banner.tsx)

### 7. Search Component (1 file)
- [`components/search/autocomplete-input.tsx`](components/search/autocomplete-input.tsx)

### 8. App Pages (12 files)
- [`app/[lang]/page.tsx`](app/[lang]/page.tsx)
- [`app/[lang]/auth/page.tsx`](app/[lang]/auth/page.tsx)
- [`app/[lang]/auth/forgot-password/page.tsx`](app/[lang]/auth/forgot-password/page.tsx)
- [`app/[lang]/auth/reset-password/page.tsx`](app/[lang]/auth/reset-password/page.tsx)
- [`app/[lang]/about/page.tsx`](app/[lang]/about/page.tsx)
- [`app/[lang]/contact/page.tsx`](app/[lang]/contact/page.tsx)
- [`app/[lang]/privacy/page.tsx`](app/[lang]/privacy/page.tsx)
- [`app/[lang]/data-export/page.tsx`](app/[lang]/data-export/page.tsx)
- [`app/[lang]/data-deletion/page.tsx`](app/[lang]/data-deletion/page.tsx)
- [`app/[lang]/blog/[slug]/page.tsx`](app/[lang]/blog/[slug]/page.tsx)
- [`app/[lang]/dashboard/components/tabs/orders-tab.tsx`](app/[lang]/dashboard/components/tabs/orders-tab.tsx)
- [`app/[lang]/dashboard/components/modals/order-detail-modal.tsx`](app/[lang]/dashboard/components/modals/order-detail-modal.tsx)

## Detailed Conversion Guide

### 1. Global Styles (globals.css)

#### Animation Updates
```css
/* Current */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }
  50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6); }
}

/* Target */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
  50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.2); }
}
```

### 2. Hero Section Pattern

#### Background
```tsx
// Current
className="bg-gradient-to-br from-purple-950 via-purple-900 to-black"

// Target
className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black"
```

#### Floating Orbs
```tsx
// Current
className="bg-purple-600/20 rounded-full blur-[100px]"
className="bg-pink-600/20 rounded-full blur-[100px]"

// Target
className="bg-white/5 rounded-full blur-[100px]"
className="bg-zinc-500/10 rounded-full blur-[100px]"
```

#### Badges
```tsx
// Current
className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30"
className="text-purple-200"

// Target
className="bg-zinc-800/50 border border-zinc-700/50"
className="text-zinc-300"
```

#### Text Gradients
```tsx
// Current
className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"

// Target
className="bg-gradient-to-r from-white via-zinc-300 to-zinc-400 bg-clip-text text-transparent"
```

#### Primary Buttons
```tsx
// Current
className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25"

// Target
className="bg-white text-zinc-900 hover:bg-zinc-200 shadow-lg shadow-black/20"
```

#### Secondary Buttons
```tsx
// Current
className="border-white/20 text-white hover:bg-white/5"

// Target
className="border-zinc-700 text-white hover:bg-zinc-800"
```

#### Product Cards
```tsx
// Current
className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 shadow-purple-500/20"

// Target
className="bg-zinc-900/50 border border-zinc-700/50 shadow-black/20 hover:border-zinc-600"
```

#### Decorative Elements
```tsx
// Current
className="border border-purple-500/30"
className="border border-pink-500/30"

// Target
className="border border-zinc-700/50"
className="border border-white/10"
```

### 3. Header Pattern

#### Navigation Links
```tsx
// Current
className="hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
className="bg-gradient-to-r from-purple-500 to-pink-500"

// Target
className="hover:text-white"
className="bg-white"
```

#### Profile Button
```tsx
// Current
className="bg-gradient-to-br from-purple-600 to-pink-600 border border-white/20"

// Target
className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
```

### 4. Benefits Section Pattern

#### Background
```tsx
// Current
className="bg-gradient-to-b from-black via-purple-950/30 to-black"
className="bg-purple-600/10 rounded-full blur-3xl"

// Target
className="bg-gradient-to-b from-black via-zinc-950/30 to-black"
className="bg-white/5 rounded-full blur-3xl"
```

#### Cards
```tsx
// Current
className="hover:border-purple-500/50 hover:shadow-purple-500/10"
className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 text-purple-400"

// Target
className="hover:border-white/20 hover:shadow-black/20"
className="bg-zinc-800 text-zinc-300"
```

### 5. Logo Component

```tsx
// Current
className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"

// Target
className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent"
```

## Color Replacement Reference Table

| Find | Replace With |
|------|--------------|
| `purple-950` | `zinc-950` |
| `purple-900` | `zinc-900` |
| `purple-800` | `zinc-800` |
| `purple-700` | `zinc-700` |
| `purple-600` | `white` (buttons) or `zinc-600` (borders) |
| `purple-500` | `zinc-500` or `white` |
| `purple-400` | `zinc-400` or `white` |
| `purple-300` | `zinc-300` |
| `purple-200` | `zinc-200` |
| `purple-100` | `zinc-100` |
| `pink-600` | `zinc-600` or `white` |
| `pink-500` | `zinc-500` or `white` |
| `pink-400` | `zinc-400` |
| `pink-300` | `zinc-300` |
| `pink-200` | `zinc-200` |
| `from-purple-600 to-pink-600` | `bg-white text-zinc-900` |
| `shadow-purple-500/25` | `shadow-black/20` |
| `shadow-purple-500/20` | `shadow-black/10` |

## Implementation Order

1. **Phase 1: Foundation**
   - Update globals.css animations
   - Update hoodiz-logo.tsx

2. **Phase 2: Core Layout**
   - Update header.tsx
   - Update footer.tsx
   - Update language-switcher.tsx

3. **Phase 3: Hero Sections**
   - Update hero-variant-1.tsx
   - Update hero-variant-2.tsx
   - Update hero-variant-3.tsx
   - Update hero-section.tsx

4. **Phase 4: Home Page Sections**
   - Update benefits-section.tsx
   - Update categories-section.tsx
   - Update featured-products.tsx

5. **Phase 5: Auth Components**
   - Update login-form.tsx
   - Update register-form.tsx
   - Update welcome-popup.tsx

6. **Phase 6: App Pages**
   - Update all page files systematically

7. **Phase 7: Remaining Components**
   - Update cookie-consent-banner.tsx
   - Update autocomplete-input.tsx
   - Update dashboard components

## Testing Checklist

- [ ] All pages load without visual errors
- [ ] Text is readable on all backgrounds
- [ ] Buttons have proper hover states
- [ ] Cards have consistent styling
- [ ] Animations work correctly
- [ ] Mobile responsive design maintained
- [ ] Dark mode toggle works (if applicable)
- [ ] No purple/pink colors remain in production code

## Notes

- Some status colors (like `purple-100 text-purple-800` for SHIPPED status) may be intentionally kept for semantic meaning
- The `pulse-glow` animation uses rgba values that need manual updating
- Gradients should be converted to solid colors or subtle zinc gradients
- Focus states should use `focus:ring-white/20` or `focus:ring-zinc-500`

'use client'

import { useEffect, useCallback } from 'react'
import { businessInfo } from '@/lib/config'

// Meta/Facebook Pixel ID - Replace with your actual Pixel ID
// Get your pixel ID from Facebook Events Manager: https://www.facebook.com/events_manager
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''

// Standard Meta Event Types
export type MetaEventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'Schedule'

// Event Data Interfaces
export interface PageViewData {
  // PageView doesn't require additional data
}

export interface ViewContentData {
  content_name?: string
  content_category?: string
  content_ids?: string[]
  content_type?: 'product' | 'product_group'
  value?: number
  currency?: string
}

export interface AddToCartData {
  content_name?: string
  content_category?: string
  content_ids?: string[]
  content_type?: 'product' | 'product_group'
  value: number
  currency: string
}

export interface InitiateCheckoutData {
  content_name?: string
  content_category?: string
  content_ids?: string[]
  content_type?: 'product' | 'product_group'
  value: number
  currency: string
  num_items?: number
}

export interface PurchaseData {
  value: number
  currency: string
  content_name?: string
  content_ids?: string[]
  content_type?: 'product' | 'product_group'
  num_items?: number
}

export interface LeadData {
  content_name?: string
}

export interface CompleteRegistrationData {
  value?: number
  currency?: string
  status?: 'complete' | 'incomplete'
}

// Initialize Meta Pixel
function initMetaPixel() {
  if (typeof window === 'undefined' || !META_PIXEL_ID) return

  // Initialize data layer
  window.dataLayer = window.dataLayer || []
  
  // Facebook Pixel Code
  const fn = function(...args: unknown[]) {
    (window.dataLayer as unknown[]).push(args)
  }
  fn('js', new Date())
  fn('config', META_PIXEL_ID)

  // Load Facebook Pixel Script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://connect.facebook.net/en_US/fbevents.js`
  document.head.appendChild(script)
}

// Track Meta Event
export function trackMetaEvent(
  eventName: MetaEventName,
  data?: Record<string, unknown>
) {
  if (typeof window === 'undefined' || !META_PIXEL_ID) {
    console.log(`[Meta Pixel] ${eventName}:`, data)
    return
  }

  // Use window.fbq if available, otherwise log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fbq = window.fbq as any
  if (fbq && typeof fbq === 'function') {
    fbq('track', eventName, data)
  } else {
    console.log(`[Meta Pixel] ${eventName}:`, data)
  }
}

// Hook to track page views
export function useMetaPixel() {
  const trackPageView = useCallback(() => {
    trackMetaEvent('PageView')
  }, [])

  const trackViewContent = useCallback((data: ViewContentData) => {
    trackMetaEvent('ViewContent', {
      ...data,
      currency: data.currency || businessInfo.currency,
    })
  }, [])

  const trackAddToCart = useCallback((data: AddToCartData) => {
    trackMetaEvent('AddToCart', {
      ...data,
      currency: data.currency || businessInfo.currency,
    })
  }, [])

  const trackInitiateCheckout = useCallback((data: InitiateCheckoutData) => {
    trackMetaEvent('InitiateCheckout', {
      ...data,
      currency: data.currency || businessInfo.currency,
    })
  }, [])

  const trackPurchase = useCallback((data: PurchaseData) => {
    trackMetaEvent('Purchase', {
      ...data,
      currency: data.currency || businessInfo.currency,
    })
  }, [])

  const trackLead = useCallback((data?: LeadData) => {
    trackMetaEvent('Lead', data as unknown as Record<string, unknown>)
  }, [])

  const trackCompleteRegistration = useCallback((data?: CompleteRegistrationData) => {
    trackMetaEvent('CompleteRegistration', {
      ...data,
      currency: data?.currency || businessInfo.currency,
    })
  }, [])

  return {
    trackPageView,
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
    trackLead,
    trackCompleteRegistration,
  }
}

// Meta Pixel Provider Component
export function MetaPixelProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initMetaPixel()
  }, [])

  return <>{children}</>
}

// Declare global window types
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

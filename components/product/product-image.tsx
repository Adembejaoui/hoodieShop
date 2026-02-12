'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

interface ProductImageProps {
  frontImage: string
  backImage?: string
  printType: 'front' | 'back' | 'both'
  productName: string
  width?: number
  height?: number
  className?: string
}

export function ProductImage({
  frontImage,
  backImage,
  printType,
  productName,
  width = 500,
  height = 500,
  className = '',
}: ProductImageProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const hasFlippedOnScroll = useRef(false)

  // Detect touch device on mount
  useEffect(() => {
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(touch)
    console.log(`[ProductImage] Touch device detected: ${touch}`)
  }, [])

  // Handle scroll-based flip on mobile/touch devices
  const handleScroll = useCallback(() => {
    if (!isTouchDevice || !backImage || !elementRef.current) return

    const element = elementRef.current
    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const elementCenter = rect.top + rect.height / 2
    const viewportCenter = viewportHeight / 2

    // Check if element is visible in viewport
    const isVisible = rect.top < viewportHeight && rect.bottom > 0

    const currentScrollY = window.scrollY
    const scrollDelta = currentScrollY - lastScrollY.current

    if (isVisible) {
      const distanceFromCenter = Math.abs(elementCenter - viewportCenter)

      // Flip when scrolling and element is near center of viewport
      if (Math.abs(scrollDelta) > 5 && distanceFromCenter < viewportHeight * 0.3) {
        // Flip to back when scrolling down, back to front when scrolling up
        if (scrollDelta > 0 && !hasFlippedOnScroll.current) {
          setIsFlipped(true)
          hasFlippedOnScroll.current = true
          console.log(`[ProductImage] Scroll flip: front -> back`)
        } else if (scrollDelta < 0 && hasFlippedOnScroll.current) {
          setIsFlipped(false)
          hasFlippedOnScroll.current = false
          console.log(`[ProductImage] Scroll flip: back -> front`)
        }
      }
    } else {
      // Reset flip state when element is out of viewport
      if (hasFlippedOnScroll.current) {
        setIsFlipped(false)
        hasFlippedOnScroll.current = false
      }
    }

    lastScrollY.current = currentScrollY
  }, [isTouchDevice, backImage])

  // Add scroll listener on mount
  useEffect(() => {
    if (!isTouchDevice) return

    window.addEventListener('scroll', handleScroll, { passive: true })
    console.log(`[ProductImage] Scroll listener added for mobile`)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      console.log(`[ProductImage] Scroll listener removed`)
    }
  }, [isTouchDevice, handleScroll])

  // Determine which image to show based on print position
  const getDisplayImage = () => {
    const canFlip = !!backImage

    if (!canFlip) {
      // No back image, show front image
      return { image: frontImage, canFlip: false }
    }

    // Has back image - enable flip
    if (printType === 'front') {
      // Front print: show front by default, flip to back on hover/scroll
      return { image: isFlipped ? backImage : frontImage, canFlip: true }
    }
    if (printType === 'back') {
      // Back print: show back by default, flip to front on hover/scroll
      return { image: isFlipped ? frontImage : backImage, canFlip: true }
    }
    // BOTH print: show front by default, flip to back on hover/scroll
    return { image: isFlipped ? backImage : frontImage, canFlip: true }
  }

  const { image: displayImage, canFlip } = getDisplayImage()

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden rounded-lg ${canFlip && !isTouchDevice ? 'cursor-pointer' : ''} ${className}`}
      onMouseEnter={() => canFlip && !isTouchDevice && setIsFlipped(true)}
      onMouseLeave={() => canFlip && !isTouchDevice && setIsFlipped(false)}
    >
      {displayImage?.startsWith('http') ? (
        // Use regular img tag for external URLs to bypass Next.js optimization issues
        <img
          src={displayImage || '/placeholder.svg'}
          alt={`${productName} ${isFlipped ? 'back' : 'front'}`}
          className="h-full w-full object-cover transition-transform duration-500 ease-out"
        />
      ) : (
        <Image
          src={displayImage || '/placeholder.svg'}
          alt={`${productName} ${isFlipped ? 'back' : 'front'}`}
          width={width}
          height={height}
          className="h-full w-full object-cover transition-transform duration-500 ease-out"
          priority
        />
      )}
      {/* Flip indicator */}
      {canFlip && (
        <div className={`absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20 ${
          isFlipped ? 'opacity-100' : ''
        }`}>
          <span className="text-sm font-medium text-white/80">
            {isFlipped 
              ? (printType === 'back' ? 'Flip to front' : 'Flip back')
              : (printType === 'back' ? 'Flip to front' : 'Flip to back')
            }
          </span>
        </div>
      )}
    </div>
  )
}

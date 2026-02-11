'use client'

import { useState } from 'react'
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

  // Determine which image to show based on print position
  const getDisplayImage = () => {
    const canFlip = !!backImage
    
    if (!canFlip) {
      // No back image, show front image
      return { image: frontImage, canFlip: false }
    }
    
    // Has back image - enable flip for all print positions
    if (printType === 'front') {
      // Front print: show front by default, flip to back on hover
      return { image: isFlipped ? backImage : frontImage, canFlip: true }
    }
    if (printType === 'back') {
      // Back print: show back by default, flip to front on hover
      return { image: isFlipped ? frontImage : backImage, canFlip: true }
    }
    // BOTH print: show front by default, flip to back on hover
    return { image: isFlipped ? backImage : frontImage, canFlip: true }
  }

  const { image: displayImage, canFlip } = getDisplayImage()

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${canFlip ? 'cursor-pointer' : ''} ${className}`}
      onMouseEnter={() => canFlip && setIsFlipped(true)}
      onMouseLeave={() => canFlip && setIsFlipped(false)}
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

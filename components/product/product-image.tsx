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

  // Determine which image to show
  const getDisplayImage = () => {
    if (printType === 'front') return frontImage
    if (printType === 'back') return backImage || frontImage
    if (printType === 'both' && isFlipped) return backImage || frontImage
    return frontImage
  }

  // Determine if we should enable hover flip
  const enableFlip = printType === 'both' && backImage

  const displayImage = getDisplayImage()

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${enableFlip ? 'cursor-pointer' : ''} ${className}`}
      onMouseEnter={() => enableFlip && setIsFlipped(true)}
      onMouseLeave={() => enableFlip && setIsFlipped(false)}
    >
      <Image
        src={displayImage || '/placeholder.svg'}
        alt={`${productName} ${isFlipped ? 'back' : 'front'}`}
        width={width}
        height={height}
        className="h-full w-full object-cover transition-transform duration-500 ease-out"
        priority
      />
      {enableFlip && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm">
          <span className="text-sm font-medium text-white/80">
            {isFlipped ? 'Flip back' : 'Flip to back'}
          </span>
        </div>
      )}
    </div>
  )
}

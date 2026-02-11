'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProductImage } from './product-image'
import { Lock } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    description: string | null
    basePrice: number
    printPosition: string
    category: {
      name: string
      slug: string
    }
    colors: Array<{
      id: string
      color: string
      frontImageURL: string | null
      backImageURL: string | null
    }>
    sizeStocks: Array<{
      id: string
      size: string
      stockQty: number
    }>
    variants: Array<{
      id: string
      color: string
      size: string
      price: number
      stockQty: number
      frontImageURL: string | null
      backImageURL: string | null
    }>
    totalStock?: number
    _useNewFormat?: boolean
  }
  showLoginPrompt: boolean
  setShowLoginPrompt: (show: boolean) => void
}

export function ProductCard({ product, showLoginPrompt, setShowLoginPrompt }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Get first color's images (supports both new and legacy formats)
  const getFirstColor = () => {
    if (product._useNewFormat && product.colors.length > 0) {
      return product.colors[0]
    }
    if (product.variants.length > 0) {
      return {
        id: product.variants[0].id,
        color: product.variants[0].color,
        frontImageURL: product.variants[0].frontImageURL,
        backImageURL: product.variants[0].backImageURL,
      }
    }
    return { id: '', color: '', frontImageURL: null, backImageURL: null }
  }

  const firstColor = getFirstColor()
  const frontImage = firstColor.frontImageURL || '/placeholder.svg'
  const backImage = firstColor.backImageURL || undefined

  // Get colors list (supports both formats)
  const getColors = () => {
    if (product._useNewFormat) {
      return product.colors.map((c) => c.color)
    }
    return [...new Set(product.variants.map((v) => v.color))]
  }

  // Get sizes list (supports both formats)
  const getSizes = () => {
    if (product._useNewFormat) {
      return product.sizeStocks.filter((s) => s.stockQty > 0).map((s) => s.size)
    }
    return [...new Set(product.variants.map((v) => v.size))]
  }

  // Determine image display based on print position
  const getImageDisplay = () => {
    const printPos = product.printPosition

    if (printPos === 'FRONT') {
      return {
        primaryImage: frontImage,
        secondaryImage: null,
        hasHover: false,
      }
    } else if (printPos === 'BACK') {
      return {
        primaryImage: backImage || frontImage,
        secondaryImage: null,
        hasHover: false,
      }
    } else {
      return {
        primaryImage: frontImage,
        secondaryImage: backImage,
        hasHover: true,
      }
    }
  }

  const { primaryImage, secondaryImage, hasHover } = getImageDisplay()

  return (
    <>
      <Link
        href={`/product/${product.category.slug}/${product.slug}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-card rounded-lg border overflow-hidden transition-shadow hover:shadow-lg">
          {/* Product Image */}
          <ProductImage
            frontImage={frontImage || '/placeholder.svg'}
            backImage={backImage || undefined}
            printType={product.printPosition.toLowerCase() as 'front' | 'back' | 'both'}
            productName={product.name}
            width={400}
            height={400}
            className="aspect-square"
          />

          {/* Print position badge */}
          <div className="absolute top-2 left-2">
            {product.printPosition === 'BOTH' ? (
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                Front & Back
              </span>
            ) : product.printPosition === 'FRONT' ? (
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                Front Print
              </span>
            ) : (
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                Back Print
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{product.category.name}</p>
            <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
            <p className="text-lg font-bold mt-2">
              ${Number(product.basePrice).toFixed(2)}
            </p>

            {/* Available variants preview */}
            <div className="flex flex-wrap gap-1 mt-2">
              {getColors().slice(0, 4).map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center px-2 py-0.5 bg-secondary rounded text-xs"
                >
                  {color}
                </span>
              ))}
              {getColors().length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{getColors().length - 4}
                </span>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                window.location.href = `/product/${product.category.slug}/${product.slug}`
              }}
              className="w-full mt-4 py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </Link>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Log in to unlock exclusive benefits!</h3>
              <p className="text-muted-foreground mb-6">
                Create an account or log in to enjoy:
              </p>
              <ul className="text-sm text-left space-y-2 mb-6 bg-secondary/50 rounded-lg p-4">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Apply coupon codes for discounts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Save your favorite hoodies
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Track your order history
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Faster checkout experience
                </li>
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 py-2.5 px-4 border rounded-lg hover:bg-secondary transition-colors"
                >
                  Continue Shopping
                </button>
                <Link
                  href="/login"
                  className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center font-medium"
                >
                  Log In
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Do not have an account?{' '}
                <Link href="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
                {' '}and get exclusive drops!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

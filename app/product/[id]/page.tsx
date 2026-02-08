'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { products } from '@/lib/mock-data'
import { ProductImage } from '@/components/product/product-image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Star, ShoppingCart, Heart, Share2, Check } from 'lucide-react'
import { notFound } from 'next/navigation'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = products.find((p) => p.id === id)

  if (!product) {
    notFound()
  }

  return <ProductContent product={product} />
}

function ProductContent({ product }: { product: (typeof products)[0] }) {
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const relatedProducts = products.filter(
    (p) => p.series === product.series && p.id !== product.id
  )

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border/50 bg-secondary/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-foreground">
                Shop
              </Link>
              <span>/</span>
              <span className="text-foreground">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Product Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Product Image */}
            <div>
              <div className="relative h-96 sm:h-[500px] rounded-lg border border-border/50 bg-secondary overflow-hidden glow-accent">
                <ProductImage
                  frontImage={product.image}
                  backImage={product.imageBack}
                  printType={product.printType}
                  productName={product.name}
                  width={500}
                  height={500}
                  className="h-full w-full"
                />
                {product.badge && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground z-10">
                    {product.badge}
                  </Badge>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="mt-4 grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 rounded-lg border border-border/50 bg-secondary overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={`${product.name} ${i + 1}`}
                      width={100}
                      height={100}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
                  {product.series}
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 pb-4 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <p className="text-4xl font-bold text-primary">${product.price}</p>
                <p className="text-sm text-muted-foreground">
                  {product.inStock ? (
                    <span className="flex items-center gap-2 text-green-500">
                      <Check className="h-4 w-4" />
                      In Stock
                    </span>
                  ) : (
                    <span className="text-destructive">Out of Stock</span>
                  )}
                </p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-semibold mb-3">Size</label>
                <div className="grid grid-cols-4 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 rounded border transition-colors font-medium ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-semibold mb-3">Color</label>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-4 py-2 rounded border transition-colors ${
                        selectedColor === color
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 rounded border border-border hover:border-primary transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 rounded border border-border hover:border-primary transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleAddToCart}
                  className={`w-full h-12 text-base transition-all ${
                    isAdded
                      ? 'bg-green-600 hover:bg-green-600'
                      : 'bg-primary hover:bg-primary/90'
                  } text-primary-foreground`}
                  disabled={!selectedSize}
                >
                  {isAdded ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-11 bg-transparent">
                    <Heart className="mr-2 h-5 w-5" />
                    Wishlist
                  </Button>
                  <Button variant="outline" className="flex-1 h-11 bg-transparent">
                    <Share2 className="mr-2 h-5 w-5" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Info Cards */}
              <div className="space-y-2 pt-4 border-t border-border/30">
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-primary">✓</span>
                  <span>Premium 100% cotton blend for maximum comfort</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-primary">✓</span>
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-primary">✓</span>
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-bold mb-8">Related Products</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.slice(0, 4).map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                    <Card className="h-full border-border/50 overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                      <div className="relative h-48 w-full bg-secondary">
                        <ProductImage
                          frontImage={relatedProduct.image}
                          backImage={relatedProduct.imageBack}
                          printType={relatedProduct.printType}
                          productName={relatedProduct.name}
                          width={300}
                          height={300}
                          className="h-48 w-full"
                        />
                      </div>
                      <CardContent className="p-4 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          {relatedProduct.series}
                        </p>
                        <h3 className="font-semibold line-clamp-2">
                          {relatedProduct.name}
                        </h3>
                        <p className="font-bold">${relatedProduct.price}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { products } from '@/lib/mock-data'
import { ProductImage } from '@/components/product/product-image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Star, ShoppingCart, Filter } from 'lucide-react'

export default function ShopPage() {
  const [selectedSeries, setSelectedSeries] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [sortBy, setSortBy] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products

    if (selectedSeries) {
      filtered = filtered.filter((p) => p.series === selectedSeries)
    }

    if (selectedSize) {
      filtered = filtered.filter((p) => p.sizes.includes(selectedSize))
    }

    if (selectedColor) {
      filtered = filtered.filter((p) => p.colors.includes(selectedColor))
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price)
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price)
      case 'newest':
        return filtered.reverse()
      case 'popular':
        return filtered.sort((a, b) => b.reviews - a.reviews)
      default:
        return filtered
    }
  }, [selectedSeries, selectedSize, selectedColor, sortBy])

  // Get unique values for filters
  const uniqueSeries = Array.from(new Set(products.map((p) => p.series)))
  const uniqueSizes = Array.from(new Set(products.flatMap((p) => p.sizes)))
  const uniqueColors = Array.from(new Set(products.flatMap((p) => p.colors)))

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">Shop</h1>
            <p className="text-muted-foreground">
              Browse our {filteredProducts.length} premium hoodies
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:sticky lg:top-24 h-fit`}>
              <div className="space-y-6 rounded-lg border border-border/50 bg-card p-6">
                <div className="flex items-center justify-between lg:hidden">
                  <h2 className="font-semibold">Filters</h2>
                  <button onClick={() => setShowFilters(false)}>×</button>
                </div>

                {/* Series Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Anime Series</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedSeries('')}
                      className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        !selectedSeries
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      All Series
                    </button>
                    {uniqueSeries.map((series) => (
                      <button
                        key={series}
                        onClick={() => setSelectedSeries(series)}
                        className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedSeries === series
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-secondary'
                        }`}
                      >
                        {series}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Size</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedSize('')}
                      className={`px-3 py-2 rounded text-sm border transition-colors ${
                        !selectedSize
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      All
                    </button>
                    {uniqueSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-2 rounded text-sm border transition-colors ${
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

                {/* Color Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Color</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedColor('')}
                      className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        !selectedColor
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      All Colors
                    </button>
                    {uniqueColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedColor === color
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-secondary'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setSelectedSeries('')
                    setSelectedSize('')
                    setSelectedColor('')
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>

            {/* Products Section */}
            <div className="lg:col-span-3 space-y-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-card p-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden bg-transparent"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                  {filteredProducts.map((product) => (
                    <Link key={product.id} href={`/product/${product.id}`}>
                      <Card className="h-full border-border/50 overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                        <div className="relative h-64 w-full bg-secondary">
                          <ProductImage
                            frontImage={product.image}
                            backImage={product.imageBack}
                            printType={product.printType}
                            productName={product.name}
                            width={300}
                            height={300}
                            className="h-64 w-full"
                          />
                          {product.badge && (
                            <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground z-10">
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {product.series}
                          </p>
                          <h3 className="font-semibold line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(product.rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              ({product.reviews})
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border/30">
                            <span className="font-bold text-lg">${product.price}</span>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-border/50 bg-card p-12 text-center">
                  <p className="text-muted-foreground">No products found matching your filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

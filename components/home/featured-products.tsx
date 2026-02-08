'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductImage } from '@/components/product/product-image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, ShoppingCart, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  basePrice: number
  printPosition: string
  frontImageURL: string | null
  backImageURL: string | null
  category: {
    name: string
    slug: string
  }
  variants: Array<{
    id: string
    color: string
    size: string
    price: number
    stockQty: number
  }>
  totalStock: number
}

interface FeaturedProductsProps {
  limit?: number
}

export function FeaturedProducts({ limit = 6 }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?limit=${limit}&inStock=true`)
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products || [])
        } else {
          setError('Failed to load products')
        }
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [limit])

  // Transform printPosition to the expected type
  const getPrintType = (printPosition: string): 'front' | 'back' | 'both' => {
    const normalized = printPosition.toLowerCase()
    if (normalized === 'back') return 'back'
    if (normalized === 'front') return 'front'
    return 'both'
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col items-center text-center">
            <div className="h-8 w-32 bg-purple-500/20 rounded animate-pulse mb-6" />
            <div className="h-10 w-64 bg-white/10 rounded animate-pulse mb-4" />
            <div className="h-6 w-96 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/60">No products available at the moment.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-16 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 mb-6">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Hot Drops</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Featured Collection
          </h2>
          <p className="text-white/60 max-w-2xl text-lg">
            Handpicked premium hoodies from our latest drops
          </p>
        </motion.div>

        {/* Product Grid */}
        <motion.div 
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={item}>
              <Link href={`/product/${product.category.slug}/${product.slug}`}>
                <div className="group relative h-full rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
                  {/* Manga panel corners */}
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-purple-500/0 group-hover:border-purple-500 transition-all z-20" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-pink-500/0 group-hover:border-pink-500 transition-all z-20" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-pink-500/0 group-hover:border-pink-500 transition-all z-20" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-purple-500/0 group-hover:border-purple-500 transition-all z-20" />

                  {/* Image Container */}
                  <div className="relative h-72 w-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 overflow-hidden">
                    <ProductImage
                      frontImage={product.frontImageURL || '/placeholder.svg'}
                      backImage={product.backImageURL || undefined}
                      printType={getPrintType(product.printPosition)}
                      productName={product.name}
                      width={300}
                      height={300}
                      className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Badge */}
                    {product.totalStock < 20 && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold px-3 py-1">
                          Low Stock
                        </Badge>
                      </div>
                    )}

                    {/* Quick add button */}
                    <motion.div
                      className="absolute bottom-4 right-4 z-10"
                      initial={{ opacity: 0, y: 20 }}
                      whileHover={{ opacity: 1, y: 0 }}
                    >
                      <Button 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </motion.div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-3 p-5">
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                      {product.category.name}
                    </p>
                    <h3 className="font-semibold text-lg line-clamp-2 text-white group-hover:text-purple-200 transition-colors">
                      {product.name}
                    </h3>

                    {/* Rating placeholder */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < 4
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-white/50">(24)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
                      <span className="font-bold text-xl text-white">${product.basePrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-pink-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div 
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-8 rounded-xl">
            <Link href="/shop">View All Products</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

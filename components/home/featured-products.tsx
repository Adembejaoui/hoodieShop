'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/product/product-card'
import { Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

interface Product {
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
  totalStock: number
  _useNewFormat?: boolean
}

interface FeaturedProductsProps {
  limit?: number
}

export function FeaturedProducts({ limit = 6 }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const t = useTranslations('featured')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?limit=${limit}&inStock=true`)
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products || [])
        } else {
          setError(t('errorLoading'))
        }
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(t('errorLoading'))
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [limit, t])

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
          <p className="text-white/60">{t('noProducts')}</p>
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
            <span className="text-blue-300 text-sm font-medium">{t('badge')}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            {t('title')}
          </h2>
          <p className="text-white/60 max-w-2xl text-lg">
            {t('subtitle')}
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
              <ProductCard 
                product={product}
                showLoginPrompt={showLoginPrompt}
                setShowLoginPrompt={setShowLoginPrompt}
              />
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
          <Link 
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all"
          >
            {t('viewAll')}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

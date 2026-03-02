'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

// Subtle grid background effect
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,zinc-800/30_1px,transparent_1px),linear-gradient(to_bottom,zinc-800/30_1px,transparent_1px)] bg-[size:4rem_4rem]" />
  </div>
)

export function HeroVariant1() {
  const t = useTranslations('hero')

  // Hoodie images for the hero section
  const hoodieImages = [
    {
      src: "https://bhxnlnpksfyqrvojlsfi.supabase.co/storage/v1/object/public/images/products/nobackground1.png",
      alt: "Premium Anime Hoodie 1",
    },
    {
      src: "https://bhxnlnpksfyqrvojlsfi.supabase.co/storage/v1/object/public/images/products/nobackground3.png",
      alt: "Premium Anime Hoodie 2", 
    },
    {
      src: "https://bhxnlnpksfyqrvojlsfi.supabase.co/storage/v1/object/public/images/products/nobackground2.png",
      alt: "Premium Anime Hoodie 3",
    }
  ]

  return (
    <section className="relative w-full min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] overflow-hidden flex items-center py-16 sm:py-0">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black z-0" />
      
      {/* Grid background */}
      <GridBackground />
      
      {/* Decorative elements - subtle orbs */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-zinc-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div 
            className="flex flex-col gap-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="space-y-6">

              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 w-fit"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-zinc-300">{t('badge')}</span>
              </motion.div>

              {/* Heading with gradient */}
              <h1 className="text-balance text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                <span className="text-white">{t('titleLine1')}</span>
                <br />
                <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-400 bg-clip-text text-transparent">
                  {t('titleLine2')}
                </span>
              </h1>

              {/* Description */}
              <p className="text-balance text-zinc-400 sm:text-lg max-w-md leading-relaxed">
                {t('description')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row pt-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button asChild size="xl" className="relative overflow-hidden bg-white text-zinc-900 hover:bg-zinc-200 font-semibold px-8 rounded-xl shadow-lg shadow-black/20 w-full sm:w-auto">
                  <Link href="/shop" className="inline-flex items-center justify-center">
                    {t('shopCollection')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button asChild variant="outline" size="xl" className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white bg-transparent rounded-xl w-full sm:w-auto">
                  <Link href="#categories">{t('exploreMore')}</Link>
                </Button>
              </motion.div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-6 border-t border-zinc-800">
              {/* Quality Badge */}
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{t('qualityTitle')}</div>
                  <div className="text-xs text-zinc-500">{t('qualityDesc')}</div>
                </div>
              </motion.div>
              
              <div className="h-12 w-px bg-zinc-800" />
              
              {/* Shipping Badge */}
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{t('shippingTitle')}</div>
                  <div className="text-xs text-zinc-500">{t('shippingDesc')}</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - 3 Hoodie Images Showcase */}
          <motion.div
            className="relative hidden lg:flex lg:justify-center lg:items-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            <div className="relative h-[600px] w-full max-w-2xl">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-br from-white/5 via-zinc-500/10 to-white/5 rounded-3xl blur-2xl" />
              
              {/* Hoodie Cards Container */}
              <div className="relative h-full w-full">
                {/* Left Hoodie Card */}
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[280px] h-[380px]"
                  initial={{ opacity: 0, x: -50, rotate: -8 }}
                  animate={{ opacity: 1, x: 0, rotate: -8 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  whileHover={{ rotate: 0, scale: 1.05, zIndex: 20 }}
                >
                  <div className="relative w-full h-full rounded-2xl border border-zinc-700/50 overflow-hidden bg-zinc-900/50 shadow-2xl shadow-black/20">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent z-10" />
                    <Image
                      src={hoodieImages[0].src}
                      alt={hoodieImages[0].alt}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="280px"
                    />
                  </div>
                </motion.div>

                {/* Center Hoodie Card (Main) */}
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[480px] z-10"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative w-full h-full rounded-3xl border-2 border-zinc-600/50 overflow-hidden bg-zinc-900/50 shadow-2xl shadow-black/30">
                    {/* Corner decorations */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-zinc-500 rounded-tl-3xl z-20" />
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-zinc-400 rounded-tr-3xl z-20" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-zinc-400 rounded-bl-3xl z-20" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-zinc-500 rounded-br-3xl z-20" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent z-10" />
                    <Image
                      src={hoodieImages[1].src}
                      alt={hoodieImages[1].alt}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="340px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
                    
                    {/* Featured badge */}
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-zinc-800/80 backdrop-blur-sm text-white text-xs font-semibold border border-zinc-700/50">
                      {t('limitedEdition')}
                    </div>
                    
                    {/* Floating badge */}
                    <motion.div
                      className="absolute bottom-4 left-4 right-4"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <div className="px-4 py-3 rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50">
                        <p className="text-white font-bold text-sm">{t('unitsLeft')}</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Right Hoodie Card */}
                <motion.div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-[280px] h-[380px]"
                  initial={{ opacity: 0, x: 50, rotate: 8 }}
                  animate={{ opacity: 1, x: 0, rotate: 8 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  whileHover={{ rotate: 0, scale: 1.05, zIndex: 20 }}
                >
                  <div className="relative w-full h-full rounded-2xl border border-zinc-700/50 overflow-hidden bg-zinc-900/50 shadow-2xl shadow-black/20">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent z-10" />
                    <Image
                      src={hoodieImages[2].src}
                      alt={hoodieImages[2].alt}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="280px"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Decorative circles */}
              <motion.div
                className="absolute -top-4 -right-4 w-28 h-28 border border-zinc-700/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-24 h-24 border border-zinc-600/30 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

// Speed line background effect - optimized with will-change for GPU acceleration
const SpeedLines = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-transparent will-change-transform"
        style={{
          width: '2px',
          height: '100%',
          left: `${10 + i * 12}%`,
          transform: 'rotate(15deg)',
        }}
        animate={{
          opacity: [0, 0.5, 0],
          height: ['100%', '150%', '100%'],
        }}
        transition={{
          duration: 2 + i * 0.2,
          repeat: Infinity,
          delay: i * 0.3,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
)

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[calc(100vh-5rem)] overflow-hidden flex items-center">
      {/* Anime Background - Using Next.js Image for optimization */}
      <Image
        src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover z-0"
        unoptimized
      />
      
      {/* Animated overlay */}
      <SpeedLines />
      
      {/* Gradient overlay with anime colors */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950/95 via-purple-900/80 to-black/90 z-10" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 w-fit"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-purple-300">New Collection Drop</span>
              </motion.div>

              {/* Heading with gradient */}
              <h1 className="text-balance text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                <span className="text-white">Wear the</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
                  Power of Anime
                </span>
              </h1>

              {/* Description */}
              <p className="text-balance text-white/80 sm:text-lg max-w-md leading-relaxed">
                Unleash your inner hero with exclusive anime hoodies. Premium quality, 
                vibrant prints, and limited editions that define your style.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-8 rounded-xl shadow-lg shadow-purple-500/25">
                  <Link href="/shop" className="inline-flex items-center justify-center">
                    Shop Collection
                    <ArrowRight className="ml-2 h-5 w-5" />
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl">
                  <Link href="#categories">Explore More</Link>
                </Button>
              </motion.div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-6 border-t border-white/10">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-black" />
                  ))}
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">5K+</div>
                  <div className="text-xs text-white/60">Happy Fans</div>
                </div>
              </motion.div>
              <div className="h-12 w-px bg-white/10" />
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">4.9</div>
                  <div className="text-xs text-white/60">Rating</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Image - Anime Character Showcase */}
          <motion.div
            className="relative hidden lg:flex lg:justify-center lg:items-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            <div className="relative h-[500px] w-full max-w-md">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-br from-purple-600/30 via-pink-600/20 to-blue-600/30 rounded-3xl blur-2xl" />
              
              {/* Main card */}
              <div className="relative h-full w-full rounded-3xl border border-white/20 overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50 shadow-2xl">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-purple-500 rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-pink-500 rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-pink-500 rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-purple-500 rounded-br-3xl" />
                
                {/* Image */}
                <Image
                  src="https://bhxnlnpksfyqrvojlsfi.supabase.co/storage/v1/object/public/images/logo-one-piece.png"
                  alt="Featured Anime Hoodie"
                  fill
                  unoptimized
                  className="object-cover"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent" />
                
                {/* Floating badge */}
                <motion.div
                  className="absolute bottom-6 left-6 right-6"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="px-6 py-4 rounded-2xl bg-black/60 backdrop-blur-sm border border-white/10">
                    <p className="text-white font-bold text-lg">Limited Edition</p>
                    <p className="text-purple-300 text-sm">Only 100 units left!</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { CategoriesSection } from '@/components/home/categories-section'
import { BenefitsSection } from '@/components/home/benefits-section'

// Fixed particle positions to avoid hydration mismatch
const PARTICLE_COUNT = 20
const FIXED_PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  left: `${5 + (i * 4.5) % 90}%`,
  top: `${10 + (i * 7) % 85}%`,
  delay: `${(i * 0.25) % 5}s`,
  duration: `${8 + (i % 5) * 2}s`,
}))

// Animated background particles - using fixed positions to prevent hydration mismatch
const BackgroundParticles = () => (
  <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
    {FIXED_PARTICLES.map((particle) => (
      <div
        key={particle.id}
        className="absolute w-1 h-1 bg-purple-500/30 rounded-full animate-float"
        style={{
          left: particle.left,
          top: particle.top,
          animationDelay: particle.delay,
          animationDuration: particle.duration,
        }}
      />
    ))}
  </div>
)

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-black">
      {mounted && <BackgroundParticles />}
      <HeroSection />
      <CategoriesSection />
      <BenefitsSection />
      <FeaturedProducts />
    </div>
  )
}

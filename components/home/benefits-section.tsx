'use client'

import { benefits } from '@/lib/mock-data'
import { motion } from 'framer-motion'

const iconMap: Record<string, React.ReactNode> = {
  '🚀': (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  '📦': (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  '💯': (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  '🎌': (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  ),
}

export function BenefitsSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black" />
      
      {/* Decorative glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-16 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 mb-6">
            <span className="text-pink-300 text-sm font-medium">Why Choose Us</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
            Power Up Your Style
          </h2>
          <p className="text-white/60 max-w-2xl text-lg">
            Premium quality with exceptional service and support
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div 
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={item}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-8 overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 rounded-2xl bg-black/90" />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon with glow */}
                  <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-all duration-300">
                    {iconMap[benefit.icon] || benefit.icon}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

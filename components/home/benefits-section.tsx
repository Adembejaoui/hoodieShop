'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Truck, Shield, Sparkles, Flame } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  'fastShipping': <Truck className="w-10 h-10" />,
  'limitedDrops': <Flame className="w-10 h-10" />,
  'premiumQuality': <Shield className="w-10 h-10" />,
  'exclusiveDesigns': <Sparkles className="w-10 h-10" />,
}

const benefitKeys = ['fastShipping', 'limitedDrops', 'premiumQuality', 'exclusiveDesigns'] as const

export function BenefitsSection() {
  const t = useTranslations('benefits')

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
            <span className="text-pink-300 text-sm font-medium">{t('badge')}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
            {t('title')}
          </h2>
          <p className="text-white/60 max-w-2xl text-lg">
            {t('subtitle')}
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
          {benefitKeys.map((key) => (
            <motion.div
              key={key}
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
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Icon with glow */}
                  <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-all duration-300">
                    {iconMap[key]}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {t(`${key}.description`)}
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

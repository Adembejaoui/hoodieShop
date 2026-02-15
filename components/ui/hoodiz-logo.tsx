interface HoodizLogoProps {
  variant?: 'full' | 'icon' | 'text'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function HoodizLogo({ variant = 'full', size = 'md', className = '' }: HoodizLogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 36, text: 'text-2xl', gap: 'gap-2' },
    lg: { icon: 48, text: 'text-3xl', gap: 'gap-3' },
  }

  const { icon: iconSize, text: textSize, gap } = sizes[size]

  const IconSvg = () => (
    <svg 
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      {/* Background gradient */}
      <defs>
        <linearGradient id="hoodizGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="hoodizTextGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0f0f0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Rounded square background */}
      <rect 
        x="2" 
        y="2" 
        width="44" 
        height="44" 
        rx="12" 
        ry="12" 
        fill="url(#hoodizGradient)"
      />
      
      {/* Inner highlight */}
      <rect 
        x="4" 
        y="4" 
        width="40" 
        height="40" 
        rx="10" 
        ry="10" 
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
      
      {/* H letter - modern stylized */}
      <g filter="url(#glow)">
        {/* Left vertical bar */}
        <rect 
          x="12" 
          y="12" 
          width="6" 
          height="24" 
          rx="2" 
          fill="url(#hoodizTextGradient)"
        />
        {/* Right vertical bar */}
        <rect 
          x="30" 
          y="12" 
          width="6" 
          height="24" 
          rx="2" 
          fill="url(#hoodizTextGradient)"
        />
        {/* Horizontal connector */}
        <rect 
          x="18" 
          y="21" 
          width="12" 
          height="6" 
          rx="2" 
          fill="url(#hoodizTextGradient)"
        />
      </g>
    </svg>
  )

  const TextLogo = () => (
    <span 
      className={`${textSize} font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent select-none`}
      style={{ letterSpacing: '-0.02em' }}
    >
      HOODIZ
    </span>
  )

  if (variant === 'icon') {
    return <span className={className}><IconSvg /></span>
  }

  if (variant === 'text') {
    return <span className={className}><TextLogo /></span>
  }

  return (
    <span className={`inline-flex items-center ${gap} ${className}`}>
      <IconSvg />
      <TextLogo />
    </span>
  )
}

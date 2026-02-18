import Image from 'next/image'

interface HoodizLogoProps {
  variant?: 'full' | 'icon' | 'text'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
}

const LOGO_URL = 'https://bhxnlnpksfyqrvojlsfi.supabase.co/storage/v1/object/public/images/logoDark.png'

export function HoodizLogo({ variant = 'full', size = 'md', className = '', showText = true }: HoodizLogoProps) {
  const sizes = {
    sm: { height: 40, text: 'text-xl', gap: 'gap-2' },
    md: { height: 52, text: 'text-2xl', gap: 'gap-3' },
    lg: { height: 72, text: 'text-3xl', gap: 'gap-4' },
    xl: { height: 96, text: 'text-4xl', gap: 'gap-5' },
  }

  const { height, text: textSize, gap } = sizes[size]

  const LogoImage = () => (
    <Image
      src={LOGO_URL}
      alt="Hoodiz Tunisia"
      height={height}
      width={height}
      className="object-contain drop-shadow-lg"
      unoptimized
      priority
    />
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
    return (
      <span className={className}>
        <LogoImage />
      </span>
    )
  }

  if (variant === 'text') {
    return <span className={className}><TextLogo /></span>
  }

  return (
    <span className={`inline-flex items-center ${gap} ${className}`}>
      <LogoImage />
      {showText && <TextLogo />}
    </span>
  )
}

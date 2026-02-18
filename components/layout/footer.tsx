'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Twitter, Instagram, Facebook, Youtube } from 'lucide-react'
import { HoodizLogo } from '@/components/ui/hoodiz-logo'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

interface Category {
  id: string
  name: string
  slug: string
  _count: {
    products: number
  }
}

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const t = useTranslations('footer')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        if (res.ok) {
          const data = await res.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <footer className="border-t border-border/50 bg-secondary py-12 text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HoodizLogo variant="full" size="md" />
            </div>
            <p className="text-sm text-muted-foreground">{t('brandDescription')}</p>
            
            {/* Socials */}
            <div className="flex gap-4 mt-4">
          
              <Link href="#" className="transition-colors hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="transition-colors hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
             
            </div>
          </div>

          {/* Shop - Dynamic Categories */}
          <div>
            <h3 className="font-semibold mb-4">{t('shop')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="transition-colors hover:text-primary">
                  {t('allProducts')}
                </Link>
              </li>
              {!loading && categories.length > 0 ? (
                categories.slice(0, 4).map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/shop/${category.slug}`} 
                      className="transition-colors hover:text-primary"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/shop?series=Cherry+Blossom" className="transition-colors hover:text-primary">
                      Cherry Blossom
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?series=Dragon+Tales" className="transition-colors hover:text-primary">
                      Dragon Tales
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?series=Cyber+Drift" className="transition-colors hover:text-primary">
                      Cyber Drift
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">{t('support')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="transition-colors hover:text-primary">
                  {t('contactUs')}
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  {t('shippingInfo')}
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  {t('returns')}
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  {t('faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="transition-colors hover:text-primary">
                  {t('aboutUs')}
                </Link>
              </li>
              {session?.user && (
                <>
                  <li>
                    <Link href="/data-export" className="transition-colors hover:text-primary">
                      {t('exportMyData')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/data-deletion" className="transition-colors hover:text-primary">
                      {t('deleteMyAccount')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/50 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
            <p>{t('copyright')}</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="transition-colors hover:text-primary">
                {t('privacyPolicy')}
              </Link>
              <Link href="/terms" className="transition-colors hover:text-primary">
                {t('termsOfService')}
              </Link>
              {session?.user && (
                <Link href="/data-export" className="transition-colors hover:text-primary">
                  {t('myData')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

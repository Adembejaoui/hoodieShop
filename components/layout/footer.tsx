'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Twitter, Instagram, Facebook, Youtube } from 'lucide-react'

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
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600" />
              <span className="font-bold">HOODIE LEGENDS</span>
            </div>
            <p className="text-sm text-muted-foreground">Premium anime hoodies and streetwear for the culture.</p>
            
            {/* Socials */}
            <div className="flex gap-4 mt-4">
              <Link href="#" className="transition-colors hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="transition-colors hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="transition-colors hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="transition-colors hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Shop - Dynamic Categories */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="transition-colors hover:text-primary">
                  All Products
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
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="transition-colors hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="transition-colors hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/50 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
            <p>&copy; 2024 Hoodie Legends. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="transition-colors hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-primary">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

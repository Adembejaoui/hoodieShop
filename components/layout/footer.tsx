import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary py-12 text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent/80" />
              <span className="font-bold">HOODIE LEGENDS</span>
            </div>
            <p className="text-sm text-muted-foreground">Premium anime hoodies and streetwear for the culture.</p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="transition-colors hover:text-primary">
                  All Products
                </Link>
              </li>
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
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
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

          {/* Socials */}
          <div>
            <h3 className="font-semibold mb-4">Follow</h3>
            <div className="flex gap-4">
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
        </div>

        <div className="mt-8 border-t border-border/50 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
            <p>&copy; 2024 Hoodie Legends. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="transition-colors hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="#" className="transition-colors hover:text-primary">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

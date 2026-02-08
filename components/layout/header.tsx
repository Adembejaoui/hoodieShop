'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Menu, X, ShoppingCart, User, Sun, Moon, LogOut, Settings, LayoutDashboard } from 'lucide-react'
import Image from 'next/image'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const { data: session, status } = useSession()


  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
              <span className="text-white font-bold text-sm relative z-10">HL</span>
            </div>
            <span className="hidden text-xl font-bold tracking-wider sm:inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              HOODIE LEGENDS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden gap-8 md:flex">
            <Link href="/" className="text-sm font-medium text-white/70 transition-all hover:text-white hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all group-hover:w-full" />
            </Link>
            <Link href="/shop" className="text-sm font-medium text-white/70 transition-all hover:text-white hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] relative group">
              Shop
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all group-hover:w-full" />
            </Link>
            <Link href="/admin" className="text-sm font-medium text-white/70 transition-all hover:text-white hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] relative group">
              Admin
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all group-hover:w-full" />
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
           
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5 text-white/70" />
                <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                  0
                </span>
              </Link>
            </Button>

            {/* Auth Section - Sign In or Profile Dropdown */}
            {status === 'loading' ? (
              // Loading state
              <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse" />
            ) : session?.user ? (
              // User is logged in - show profile dropdown
              <div className="relative" ref={profileRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="relative h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border border-white/20 hover:from-purple-500 hover:to-pink-500 transition-all"
                >
               
                    <User className="h-5 w-5 text-white" />
               
                </Button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-black/90 backdrop-blur-xl border border-white/10 py-2 shadow-2xl animate-in slide-in-from-top-2">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white truncate">{session.user.name || 'User'}</p>
                      <p className="text-xs text-white/60 truncate">{session.user.email}</p>
                    </div>
                    
                    {/* Dropdown Items */}
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <div className="border-t border-white/10 mt-2 pt-2">
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // User is not logged in - show Sign In link
              <Button asChild variant="ghost" className="text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-full px-4">
                <Link href="/auth">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="border-t border-white/10 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
                Home
              </Link>
              <Link href="/shop" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
                Shop
              </Link>
              <Link href="/admin" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
                Admin
              </Link>
              {session?.user ? (
                <>
                  <Link href="/dashboard" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
                    Dashboard
                  </Link>
                  <Link href="/settings" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm font-medium text-red-400 transition-colors hover:text-red-300 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/auth" className="text-sm font-medium text-purple-400 transition-colors hover:text-purple-300">
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

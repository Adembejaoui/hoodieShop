'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Heart, Sparkles, Users, Zap, Shield, Truck } from "lucide-react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';

export default function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const t = useTranslations('about');
  const tMission = useTranslations('about.mission');
  const tStats = useTranslations('about.stats');
  const tFloatingBadges = useTranslations('about.floatingBadges');
  const tValues = useTranslations('about.values');
  const tCta = useTranslations('about.cta');



  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4">{t('badge')}</Badge>
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              {t('titleLine1')}
              <br />
              {t('titleLine2')}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              {t('description')}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/shop">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  {t('exploreCollection')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">
                  {t('getInTouch')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">{tMission('badge')}</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                {tMission('title')}
              </h2>
              <p className="text-muted-foreground mb-4">
                {tMission('paragraph1')}
              </p>
              <p className="text-muted-foreground mb-6">
                {tMission('paragraph2')}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">50K+</div>
                  <div className="text-sm text-muted-foreground">{tStats('happyCustomers')}</div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-500">100+</div>
                  <div className="text-sm text-muted-foreground">{tStats('uniqueDesigns')}</div>
                </div>
    
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">99%</div>
                  <div className="text-sm text-muted-foreground">{tStats('satisfaction')}</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-secondary/20 rounded-2xl border">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 rounded-xl bg-purple-600 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-white fill-current" />
                  </div>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 p-3 bg-background rounded-lg border shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{tFloatingBadges('premiumQuality')}</span>
                </div>
              </div>
              <div className="absolute -bottom-3 -left-3 p-3 bg-background rounded-lg border shadow-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{tFloatingBadges('fastShipping')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">{tValues('badge')}</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{tValues('title')}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-background rounded-xl border">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">{tValues('authenticDesigns.title')}</h3>
              <p className="text-sm text-muted-foreground">{tValues('authenticDesigns.description')}</p>
            </div>
            <div className="p-6 bg-background rounded-xl border">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">{tValues('premiumQuality.title')}</h3>
              <p className="text-sm text-muted-foreground">{tValues('premiumQuality.description')}</p>
            </div>
            <div className="p-6 bg-background rounded-xl border">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">{tValues('communityFirst.title')}</h3>
              <p className="text-sm text-muted-foreground">{tValues('communityFirst.description')}</p>
            </div>
            <div className="p-6 bg-background rounded-xl border">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">{tValues('fastDelivery.title')}</h3>
              <p className="text-sm text-muted-foreground">{tValues('fastDelivery.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
  

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-purple-600 p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {tCta('title')}
            </h2>
            <p className="mb-8 opacity-90 max-w-xl mx-auto">
              {tCta('description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                  {tCta('shopNow')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  {tCta('contactUs')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

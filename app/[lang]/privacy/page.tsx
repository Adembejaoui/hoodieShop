'use client'

import { useTranslations } from 'next-intl';
import { Shield, Eye, Lock, Mail, User, FileText } from 'lucide-react';

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-16 w-16 text-purple-400 mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('description')}
          </p>
          <p className="text-sm text-white/60 mt-4">
            {t('lastUpdated')}: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Table of Contents */}
          <div className="mb-12 p-6 bg-secondary/30 rounded-xl border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              {t('tableOfContents')}
            </h2>
            <nav className="space-y-2 text-sm">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <a key={num} href={`#section-${num}`} className="block text-muted-foreground hover:text-foreground transition-colors">
                  {num}. {t(`sections.${num}.title`)}
                </a>
              ))}
            </nav>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <div key={num} id={`section-${num}`} className="scroll-mt-20">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-purple-400">{num}.</span> {t(`sections.${num}.title`)}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`sections.${num}.content`)}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-6 bg-secondary/30 rounded-xl border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-400" />
              {t('contact.title')}
            </h3>
            <p className="text-muted-foreground">
              {t('contact.description')}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Email: support@hoodiz.tn
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

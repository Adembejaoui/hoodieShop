'use client'

import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Link } from '@/i18n/routing';

export default function TermsPage() {
  const t = useTranslations('terms');
  const tSections = useTranslations('terms.sections');

  const sections = [
    'acceptance',
    'useOfServices',
    'userAccounts',
    'privacyPolicy',
    'intellectualProperty',
    'limitationOfLiability',
    'changesToTerms',
    'contactInformation'
  ] as const;

  return (
    <div className="container mx-auto max-w-4xl py-12 px-6">
      <div className="prose dark:prose-invert max-w-none">
        <h1>{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('lastUpdated')}: {new Date().toLocaleDateString()}
        </p>

        {sections.map((section) => (
          <section key={section}>
            <h2>{tSections(`${section}.title`)}</h2>
            <p>
              {tSections(`${section}.content`)}
            </p>
          </section>
        ))}

        <div className="mt-8">
          <Link href="/auth">
            <Button>{t('backToRegistration')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

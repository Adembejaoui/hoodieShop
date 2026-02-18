'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield 
} from 'lucide-react';

export default function DataDeletionPage() {
  const [confirmation, setConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const t = useTranslations('gdpr.delete');
  const tWarningItems = useTranslations('gdpr.delete.warningItems');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmation.toLowerCase() !== t('confirmCode')) {
      setMessage({ 
        type: 'error', 
        text: t('confirmError')
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/gdpr/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: t('success')
        });
        setConfirmation('');
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || t('error')
        });
      }
    } catch {
      setMessage({ 
        type: 'error', 
        text: t('genericError')
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
            <Trash2 className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('description')}
          </p>
        </div>

        {/* Warning Box */}
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-8">
          <h2 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t('warningTitle')}
          </h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong className="text-red-300">{tWarningItems('permanent')}</strong></li>
            <li>• {tWarningItems('orders')}</li>
            <li>• {tWarningItems('wishlist')}</li>
            <li>• {tWarningItems('access')}</li>
            <li>• {tWarningItems('pending')}</li>
          </ul>
        </div>

        {/* Form */}
        <div className="bg-secondary/30 rounded-xl border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                {t('confirmLabel')} <code className="bg-white/10 px-2 py-0.5 rounded">{t('confirmCode')}</code>
              </Label>
              <Input
                id="confirmation"
                type="text"
                placeholder={t('confirmPlaceholder')}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                required
              />
            </div>

            {message && (
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-red-500/10 border border-red-500/20'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <p className={`text-sm ${message.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                  {message.text}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  {t('deleteButton')}
                </>
              )}
            </Button>
          </form>
        </div>

        {/* GDPR Notice */}
        <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            {t('gdprNotice').replace('{link}', '')}{' '}
            <a 
              href="https://gdpr.eu/article-17-right-to-erasure/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              {t('gdprLink')}
            </a>
          </p>
        </div>

        {/* Contact */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('questions').replace('{link}', '')}{' '}
            <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline">
              {t('contactLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

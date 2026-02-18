'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { 
  Download, 
  FileJson, 
  CheckCircle, 
  AlertCircle,
  Loader2 
} from 'lucide-react';

export default function DataExportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const t = useTranslations('gdpr.export');
  const tDataTypes = useTranslations('gdpr.export.dataTypes');

  const handleExport = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        // Trigger file download
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hoodie-legends-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setMessage({ 
          type: 'success', 
          text: t('success')
        });
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-6">
            <Download className="h-8 w-8 text-purple-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('description')}
          </p>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg mb-8">
          <h2 className="font-semibold text-purple-300 mb-2">
            {t('whatData')}
          </h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {tDataTypes('account')}</li>
            <li>• {tDataTypes('orders')}</li>
            <li>• {tDataTypes('addresses')}</li>
            <li>• {tDataTypes('wishlist')}</li>
            <li>• {tDataTypes('preferences')}</li>
          </ul>
        </div>

        {/* Export Button */}
        <div className="bg-secondary/30 rounded-xl border p-6">
          {message && (
            <div className={`p-4 rounded-lg flex items-start gap-3 mb-6 ${
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
            onClick={handleExport}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('exporting')}
              </>
            ) : (
              <>
                <FileJson className="h-4 w-4 mr-2" />
                {t('exportButton')}
              </>
            )}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t('footer').replace('{link}', '')}{' '}
            <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline">
              {t('contactLink')}
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

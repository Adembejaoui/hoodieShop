'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmation.toLowerCase() !== 'delete my account') {
      setMessage({ 
        type: 'error', 
        text: 'Please type "delete my account" to confirm.' 
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
          text: 'Your account deletion request has been received. You will receive a confirmation email shortly.' 
        });
        setConfirmation('');
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to process deletion request. Please try again.' 
        });
      }
    } catch {
      setMessage({ 
        type: 'error', 
        text: 'An error occurred. Please try again later.' 
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
            Delete Your Account
          </h1>
          <p className="text-muted-foreground text-lg">
            Request permanent deletion of your personal data.
          </p>
        </div>

        {/* Warning Box */}
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-8">
          <h2 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Before you proceed:
          </h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• This action is <strong className="text-red-300">permanent and cannot be undone</strong></li>
            <li>• All your order history will be deleted</li>
            <li>• Your wishlist items will be removed</li>
            <li>• You will lose access to your account immediately</li>
            <li>• If you have pending orders, please contact support first</li>
          </ul>
        </div>

        {/* Form */}
        <div className="bg-secondary/30 rounded-xl border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type <code className="bg-white/10 px-2 py-0.5 rounded">delete my account</code> to confirm
              </Label>
              <Input
                id="confirmation"
                type="text"
                placeholder="delete my account"
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
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Permanently Delete My Account
                </>
              )}
            </Button>
          </form>
        </div>

        {/* GDPR Notice */}
        <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            This request is processed in accordance with{' '}
            <a 
              href="https://gdpr.eu/article-17-right-to-erasure/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Article 17 of the GDPR
            </a>
            {' '}(Right to Erasure). We will confirm your deletion request via email within 24 hours.
          </p>
        </div>

        {/* Contact */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Have questions?{' '}
            <a href="/contact" className="text-purple-400 hover:text-purple-300 underline">
              Contact our support team
            </a>
            {' '}for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

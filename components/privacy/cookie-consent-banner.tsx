'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie, Settings } from 'lucide-react';
import { 
  getConsentCookie, 
  setConsentCookie, 
  ConsentPreferences,
  CONSENT_VERSION 
} from '@/lib/gdpr/consent-manager';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: '',
    version: CONSENT_VERSION,
  });

  useEffect(() => {
    const consent = getConsentCookie();
    if (!consent || consent.version !== CONSENT_VERSION) {
      setShowBanner(true);
    } else {
      setPreferences(consent);
    }
  }, []);

  const handleAcceptAll = () => {
    const newPreferences: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    setConsentCookie(newPreferences);
    setPreferences(newPreferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleRejectAll = () => {
    const newPreferences: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    setConsentCookie(newPreferences);
    setPreferences(newPreferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    const newPreferences: ConsentPreferences = {
      ...preferences,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    setConsentCookie(newPreferences);
    setPreferences(newPreferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (category: keyof Omit<ConsentPreferences, 'timestamp' | 'version'>) => {
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!showBanner && !showPreferences) return null;

  return (
    <>
      {/* Main Banner */}
      {showBanner && !showPreferences && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t border-white/10 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Cookie className="h-6 w-6 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white">
                    We use cookies to enhance your experience. By clicking "Accept All", you consent to our use of cookies.
                    {' '}
                    <a 
                      href="/privacy" 
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreferences(true)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Reject All
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-black border border-white/20 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Cookie Preferences</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreferences(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Necessary Cookies */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-white">Necessary Cookies</h3>
                  <p className="text-xs text-white/60 mt-1">
                    Required for the website to function properly. Cannot be disabled.
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={preferences.necessary}
                    disabled
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-purple-600 rounded-full peer peer-checked:bg-purple-600 cursor-not-allowed opacity-50"></div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-white">Analytics Cookies</h3>
                  <p className="text-xs text-white/60 mt-1">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={() => handlePreferenceChange('analytics')}
                    className="sr-only peer"
                  />
                  <div 
                    className="w-11 h-6 bg-white/20 rounded-full cursor-pointer peer peer-checked:bg-purple-600 peer-focus:ring-2 peer-focus:ring-purple-500"
                    onClick={() => handlePreferenceChange('analytics')}
                  >
                    <div 
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        preferences.analytics ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-white">Marketing Cookies</h3>
                  <p className="text-xs text-white/60 mt-1">
                    Used to deliver personalized advertisements.
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={() => handlePreferenceChange('marketing')}
                    className="sr-only peer"
                  />
                  <div 
                    className="w-11 h-6 bg-white/20 rounded-full cursor-pointer peer peer-checked:bg-purple-600 peer-focus:ring-2 peer-focus:ring-purple-500"
                    onClick={() => handlePreferenceChange('marketing')}
                  >
                    <div 
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        preferences.marketing ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-white/10">
              <Button
                variant="outline"
                onClick={handleRejectAll}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Reject All
              </Button>
              <Button
                onClick={handleSavePreferences}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

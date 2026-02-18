"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AlertTriangle, LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from 'next-intl';

export default function BlockedPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = useTranslations('blocked');
  const locale = useLocale();

  useEffect(() => {
    // Redirect to home if user is not blocked
    if (status === "loading") return;
    const user = session?.user as { isBlocked?: boolean } | undefined;
    if (!user?.isBlocked) {
      router.push(`/${locale}`);
    }
  }, [session, status, router, locale]);

  const handleContactSupport = () => {
    window.location.href = "mailto:adembejaoui59@gmail.com";
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `/${locale}` });
  };

  const user = session?.user as { isBlocked?: boolean } | undefined;
  
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user?.isBlocked) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('description')}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <p className="text-gray-700 text-center mb-6">
              {t('contactMistake')}
            </p>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleContactSupport}
              >
                <Mail className="w-4 h-4 mr-2" />
                {t('contactSupport')}
              </Button>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('signOut')}
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500">
            {t('footer')}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  const t = useTranslations("unauthorized");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <ShieldX className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t("description")}
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t("goHome")}
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-indigo-400 dark:hover:bg-gray-700"
          >
            {t("browseProducts")}
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          {t("contactSupport")}
        </p>
      </div>
    </div>
  );
}

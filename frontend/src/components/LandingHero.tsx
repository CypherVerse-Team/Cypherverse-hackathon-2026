'use client';

import { useLanguage } from '@/context/LanguageContext';
import SearchFilters from './SearchFilters';
import { Suspense } from 'react';

export default function LandingHero() {
  const { t } = useLanguage();
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('home.heroTitle')}</h1>
      <p className="text-gray-500 mb-8 max-w-2xl mx-auto">{t('home.heroSub')}</p>
      <Suspense fallback={<div className="h-12 bg-gray-100 rounded-xl max-w-4xl mx-auto animate-pulse"></div>}>
        <SearchFilters />
      </Suspense>
    </div>
  );
}

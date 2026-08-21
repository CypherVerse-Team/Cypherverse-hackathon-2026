'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 justify-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input 
          type="text" 
          placeholder={t('home.searchPlaceholder')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input 
          type="text" 
          placeholder={t('home.locationPlaceholder')}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors">
        {t('home.searchBtn')}
      </button>
    </form>
  );
}

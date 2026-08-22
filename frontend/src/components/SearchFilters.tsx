'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, MapPin, Sparkles, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [keyword, setKeyword] = useState(searchParams.get('q') || searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('city') || searchParams.get('location') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (location) params.set('city', location);
    router.push(`/?${params.toString()}`);
  };

  const handleQuickTag = (tag: string) => {
    setKeyword(tag);
    const params = new URLSearchParams();
    params.set('q', tag);
    if (location) params.set('city', location);
    router.push(`/?${params.toString()}`);
  };

  const quickTags = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Mason'];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <form 
        onSubmit={handleSearch} 
        className="bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 flex flex-col md:flex-row gap-3 items-center transition-all duration-300 hover:shadow-indigo-500/10"
      >
        {/* Keyword Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
          <input 
            type="text" 
            placeholder={t('home.searchPlaceholder') || "Search skills e.g. Electrician, Plumbing..."}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl sm:rounded-2xl text-slate-800 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location Input */}
        <div className="relative flex-1 w-full">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
          <input 
            type="text" 
            placeholder={t('home.locationPlaceholder') || "City or Location..."}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl sm:rounded-2xl text-slate-800 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
          {location && (
            <button
              type="button"
              onClick={() => setLocation('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3.5 px-8 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 text-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{t('home.searchBtn') || "Find Workers"}</span>
        </button>
      </form>

      {/* Quick Tag Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <span className="text-xs font-semibold text-slate-300 mr-1">Popular searches:</span>
        {quickTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleQuickTag(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
              keyword.toLowerCase() === tag.toLowerCase()
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10 backdrop-blur-md'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}


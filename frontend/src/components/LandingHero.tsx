'use client';

import { useLanguage } from '@/context/LanguageContext';
import SearchFilters from './SearchFilters';
import { Suspense } from 'react';
import { ShieldCheck, Lock, Zap, Star, Users, CheckCircle2, Award } from 'lucide-react';

export default function LandingHero() {
  const { t } = useLanguage();
  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-2xl border border-slate-800/80 overflow-hidden text-center">
      {/* Background Decorative Glow Circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        
        {/* Top Announcement Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-indigo-300 backdrop-blur-md shadow-inner">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>India's Premier Verified Skilled Labour & Contractor Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          {t('home.heroTitle') || "Hire Verified Skilled Labour & Teams On-Demand"}
        </h1>

        {/* Hero Subtitle */}
        <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          {t('home.heroSub') || "Direct connection with verified Electricians, Plumbers, Carpenters, Painters & Construction Crews. 100% Escrow protected transactions."}
        </p>

        {/* Search Filters */}
        <div className="pt-2">
          <Suspense fallback={<div className="h-14 bg-slate-800/60 rounded-3xl max-w-4xl mx-auto animate-pulse" />}>
            <SearchFilters />
          </Suspense>
        </div>

        {/* Platform Trust Highlights Bar */}
        <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          
          <div className="flex items-center space-x-3 bg-white/5 p-3.5 rounded-2xl border border-white/5 backdrop-blur-xs">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">100% Verified KYC</div>
              <div className="text-[11px] text-slate-400">Govt ID & Skill Verified</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 p-3.5 rounded-2xl border border-white/5 backdrop-blur-xs">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Escrow Secured</div>
              <div className="text-[11px] text-slate-400">Payouts after job approval</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 p-3.5 rounded-2xl border border-white/5 backdrop-blur-xs">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">4.9/5 Average Rating</div>
              <div className="text-[11px] text-slate-400">From 50,000+ bookings</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 p-3.5 rounded-2xl border border-white/5 backdrop-blur-xs">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Zero Commission</div>
              <div className="text-[11px] text-slate-400">Transparent direct rates</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}


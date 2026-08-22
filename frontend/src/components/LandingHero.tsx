'use client';

import { useLanguage } from '@/context/LanguageContext';
import SearchFilters from './SearchFilters';
import { Suspense } from 'react';
import { ShieldCheck, Lock, Zap, Star, Award } from 'lucide-react';

export default function LandingHero() {
  const { t } = useLanguage();
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(37,99,235,0.28),transparent_34%),radial-gradient(circle_at_85%_85%,rgba(79,70,229,0.3),transparent_38%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#111827_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />
      <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 -right-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl space-y-6 p-8 sm:p-12 lg:p-14">
        
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
        <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-8 text-left sm:grid-cols-2 md:grid-cols-4">
          
          <div className="flex items-center space-x-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">100% Verified KYC</div>
              <div className="text-[11px] text-slate-400">Govt ID & Skill Verified</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Escrow Secured</div>
              <div className="text-[11px] text-slate-400">Payouts after job approval</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">4.9/5 Average Rating</div>
              <div className="text-[11px] text-slate-400">From 50,000+ bookings</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10">
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


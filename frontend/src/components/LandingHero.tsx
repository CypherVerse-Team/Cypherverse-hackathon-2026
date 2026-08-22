'use client';

import { useLanguage } from '@/context/LanguageContext';
import SearchFilters from './SearchFilters';
import { Suspense } from 'react';
import { ShieldCheck, Lock, Star, Award } from 'lucide-react';

export default function LandingHero() {
  const { t } = useLanguage();
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#030712] bg-cover bg-center bg-no-repeat text-white shadow-2xl text-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356f27?q=80&w=2000&auto=format&fit=crop')",
      }}
    >
      {/* Keep the background subdued so the foreground content stays legible. */}
      <div className="absolute inset-0 z-[1] bg-black/70 pointer-events-none" />

      {/* 1. Deep Indigo/Blue base gradient */}
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_top,rgba(30,58,138,0.35)_0%,rgba(15,23,42,0.8)_60%,rgba(3,7,18,1)_100%)] pointer-events-none" />
      
      {/* 2. Top-center Spotlight Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] z-[3] bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.18),transparent_65%)] pointer-events-none" />
      
      {/* 3. Left Ambient Cyan/Blue Blur */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] z-[3] rounded-full bg-cyan-600/10 blur-[130px] mix-blend-screen pointer-events-none animate-[pulse_8s_infinite]" />
      
      {/* 4. Right Ambient Indigo/Purple Blur */}
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] z-[3] rounded-full bg-indigo-600/15 blur-[130px] mix-blend-screen pointer-events-none animate-[pulse_10s_infinite_1s]" />

      {/* 5. Central horizontal ambient accent line */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[85%] h-[1px] z-[3] bg-gradient-to-r from-transparent via-blue-500/25 to-transparent pointer-events-none" />

      {/* 6. Subtle background grid pattern with radial fading mask */}
      <div 
        className="absolute inset-0 z-[3] pointer-events-none opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 90%)'
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl space-y-8 p-8 sm:p-12 lg:p-16">
        
        {/* Top Announcement Badge */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-200 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.05)] transition-all duration-300 hover:border-white/20 hover:bg-white/10 cursor-default">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-blue-300 font-semibold tracking-wide uppercase text-[10px]">Verify & Trust</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">India&apos;s Premier Skilled Labour &amp; Contractor Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
            {t('home.heroTitle') || "Hire Verified Skilled Labour & Teams On-Demand"}
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed opacity-90">
          {t('home.heroSub') || "Direct connection with verified Electricians, Plumbers, Carpenters, Painters & Construction Crews. 100% Escrow protected transactions."}
        </p>

        {/* Search Filters */}
        <div className="pt-2">
          <Suspense fallback={<div className="h-16 bg-slate-900/60 border border-white/5 rounded-3xl max-w-4xl mx-auto animate-pulse" />}>
            <SearchFilters />
          </Suspense>
        </div>

        {/* Platform Trust Highlights Bar */}
        <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-10 text-left sm:grid-cols-2 md:grid-cols-4">
          
          <div className="flex items-center space-x-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 p-4 group">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/25 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">100% Verified KYC</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Govt ID & Skill Verified</div>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 p-4 group">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">Escrow Secured</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Payouts after job approval</div>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 p-4 group">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/25 group-hover:scale-110 transition-transform duration-300">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">4.9/5 Rating</div>
              <div className="text-[11px] text-slate-400 mt-0.5">From 50,000+ bookings</div>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 p-4 group">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/25 group-hover:scale-110 transition-transform duration-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">Zero Commission</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Transparent direct rates</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}


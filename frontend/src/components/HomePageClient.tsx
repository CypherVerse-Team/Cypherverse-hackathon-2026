'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, MapPin, Star, ShieldCheck, CheckCircle2, 
  ArrowRight, Shield, Award, Users, Layers, Sparkles, 
  Filter, RefreshCcw, Briefcase, Calendar, Lock, Clock,
  ChevronRight, Phone, Send, Check, X, SlidersHorizontal
} from 'lucide-react';
import LandingHero from '@/components/LandingHero';
import AnimatedWorkerShowcase from '@/components/AnimatedWorkerShowcase';
import BookingModal, { BookingWorkerInfo } from '@/components/BookingModal';
import { cleanName } from '@/lib/api';

const TRADE_PHOTOS: Record<string, string> = {
  electrician: '/workers/electrician.jpg',
  plumber: '/workers/plumber.jpg',
  carpenter: '/workers/carpenter.jpg',
  construction: '/workers/construction.jpg',
  painter: '/workers/painter.jpg',
  mason: '/workers/construction.jpg',
  welder: '/workers/construction.jpg',
};

const getWorkerPhoto = (profession: string, idx: number) => {
  const p = (profession || '').toLowerCase();
  for (const [key, photo] of Object.entries(TRADE_PHOTOS)) {
    if (p.includes(key)) return photo;
  }
  const defaultPhotos = [
    '/workers/electrician.jpg',
    '/workers/plumber.jpg',
    '/workers/carpenter.jpg',
    '/workers/construction.jpg',
    '/workers/painter.jpg',
  ];
  return defaultPhotos[idx % defaultPhotos.length];
};

const POPULAR_TAGS = [
  'All Trades',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Construction Worker',
  'Painter',
  'Mason'
];

interface HomePageClientProps {
  initialWorkers: any[];
  categories: any[];
  initialCategory?: string;
  initialQuery?: string;
  initialCity?: string;
  initialVerified?: boolean;
}

export default function HomePageClient({
  initialWorkers,
  categories,
  initialCategory = '',
  initialQuery = '',
  initialCity = '',
  initialVerified = false
}: HomePageClientProps) {
  // Search & Filter State
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerified);
  const [maxRate, setMaxRate] = useState<number>(1000);
  const [activeTabTag, setActiveTabTag] = useState<string>(initialQuery || 'All Trades');

  // Booking Modal State
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<BookingWorkerInfo | null>(null);

  // Real-time client filter on initialWorkers + live search
  const filteredWorkers = useMemo(() => {
    return initialWorkers.filter(w => {
      const q = query.toLowerCase().trim();
      const nameMatch = !q || w.name?.toLowerCase().includes(q);
      const profMatch = !q || w.profession?.toLowerCase().includes(q);
      const cityMatchQuery = !q || w.home_city?.toLowerCase().includes(q);

      const matchesQuery = nameMatch || profMatch || cityMatchQuery;

      const matchesCategory = !selectedCategory || 
        w.profession?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (w.rawSkills && w.rawSkills.some((s: string) => s.toLowerCase().includes(selectedCategory.toLowerCase())));

      const matchesCity = !selectedCity || 
        w.home_city?.toLowerCase().includes(selectedCity.toLowerCase());

      const matchesVerified = !verifiedOnly || w.verified;

      const matchesRate = !w.hourly_rate || w.hourly_rate <= maxRate;

      return matchesQuery && matchesCategory && matchesCity && matchesVerified && matchesRate;
    });
  }, [initialWorkers, query, selectedCategory, selectedCity, verifiedOnly, maxRate]);

  // Handle Quick Tag Click
  const handleTagClick = (tag: string) => {
    setActiveTabTag(tag);
    if (tag === 'All Trades') {
      setQuery('');
      setSelectedCategory('');
    } else {
      setQuery(tag);
    }
  };

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedCity('');
    setVerifiedOnly(false);
    setMaxRate(1000);
    setActiveTabTag('All Trades');
  };

  const isFiltered = Boolean(query || selectedCategory || selectedCity || verifiedOnly || maxRate < 1000);

  return (
    <div className="space-y-12 py-2">
      
      {/* 1. Sleek Hero Section */}
      <LandingHero />

      {/* 2. Interactive Animated Trade Worker Showcase */}
      <AnimatedWorkerShowcase />

      {/* 3. Live Worker Search & Filter Console */}
      <div id="workers-section" className="space-y-6 pt-4">
        
        {/* Search & Filter Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-1.5">
                <Sparkles size={13} className="text-indigo-600" />
                <span>Live Verified Labour Directory</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Search & Hire Verified Workers
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct booking with escrow protection, instant availability, and transparent rates
              </p>
            </div>

            {/* Quick Status Count */}
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200">
                <Users size={14} className="text-indigo-600" />
                <span>{filteredWorkers.length} Workers Available</span>
              </span>
              {isFiltered && (
                <button
                  onClick={handleResetFilters}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <RefreshCcw size={13} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Inputs Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            
            {/* Keyword Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by skill, name (e.g. Electrician, Mason)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* City / Location Filter */}
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by city (e.g. Noida, Delhi)..."
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-8 py-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {selectedCity && (
                <button 
                  onClick={() => setSelectedCity('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Filters (Verified & Price) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  verifiedOnly 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck size={16} />
                <span>Verified KYC Only</span>
              </button>

              <div className="relative min-w-[120px]">
                <select
                  value={maxRate}
                  onChange={(e) => setMaxRate(Number(e.target.value))}
                  className="w-full py-3 px-3 rounded-2xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value={1000}>All Rates</option>
                  <option value={350}>Under ₹350/hr</option>
                  <option value={500}>Under ₹500/hr</option>
                  <option value={700}>Under ₹700/hr</option>
                </select>
              </div>
            </div>

          </div>

          {/* Quick Filter Trade Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400 mr-1">Popular Trades:</span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  (tag === 'All Trades' && !query) || query.toLowerCase() === tag.toLowerCase()
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

        </div>

        {/* 4. Worker Results Grid */}
        {filteredWorkers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 shadow-xs space-y-3">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Users size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Matching Workers Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any workers matching your search criteria. Try clearing filters or searching for general trades.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <RefreshCcw size={13} />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.map((worker: any, idx: number) => {
              const workerPhoto = getWorkerPhoto(worker.profession, idx);

              return (
                <div 
                  key={worker.id}
                  className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Top Worker Image & Badges */}
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={workerPhoto}
                        alt={worker.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 backdrop-blur-md shadow-xs flex items-center gap-1">
                          <Star size={12} className="text-amber-500 fill-amber-400" />
                          {worker.rating} ({worker.jobs} jobs)
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center shadow-xs ${
                          worker.status === 'AVAILABLE_NOW' 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-amber-500 text-white'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full mr-1 bg-white" />
                          {worker.status === 'AVAILABLE_NOW' ? 'Available' : 'Busy'}
                        </span>
                      </div>

                      {/* Bottom Worker Identity */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-white drop-shadow-sm truncate">
                            {worker.name}
                          </h3>
                          {worker.verified && (
                            <span title="Govt KYC & Skill Verified" className="text-blue-400">
                              <ShieldCheck size={16} className="fill-blue-500 text-white" />
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-indigo-200 font-semibold truncate block">
                          {worker.profession}
                        </span>
                      </div>
                    </div>

                    {/* Card Body Info */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center space-x-1.5">
                          <MapPin size={14} className="text-indigo-500 flex-shrink-0" />
                          <span className="truncate max-w-[130px] font-medium">{worker.home_city}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                          <Lock size={12} />
                          <span>Escrow Protected</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Rate + Book Now Action */}
                  <div className="bg-slate-50/90 px-4 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xl font-black text-slate-900 font-mono">₹{worker.hourly_rate}</span>
                      <span className="text-slate-500 text-xs font-medium"> / hr</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link 
                        href={`/worker/${worker.id}`} 
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all"
                      >
                        Profile
                      </Link>
                      
                      <button
                        onClick={() => setSelectedWorkerForBooking({
                          id: worker.id,
                          name: worker.name,
                          profession: worker.profession,
                          hourly_rate: worker.hourly_rate,
                          home_city: worker.home_city,
                          rating: worker.rating,
                          verified: worker.verified,
                          photo: workerPhoto
                        })}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Calendar size={13} />
                        <span>Book Now</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 5. Escrow Protection & Process Guarantee Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Simple, Safe & Direct</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">How ShramSetu Protects Every Booking</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-black text-lg flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="font-bold text-white text-sm">Select & Book Worker</h3>
            <p className="text-xs text-slate-300">Browse verified trade workers, choose your date and required hours, and submit an instant request.</p>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-lg flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="font-bold text-white text-sm">Escrow Locked Payment</h3>
            <p className="text-xs text-slate-300">Your payment is held safely in escrow. Worker is notified with site location details to start the job.</p>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 font-black text-lg flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="font-bold text-white text-sm">Verify Work & Release Payout</h3>
            <p className="text-xs text-slate-300">Inspect the completed job and release payment directly to the worker. 24/7 dispute support included.</p>
          </div>
        </div>
      </div>

      {/* Global Booking Modal */}
      <BookingModal
        worker={selectedWorkerForBooking}
        isOpen={Boolean(selectedWorkerForBooking)}
        onClose={() => setSelectedWorkerForBooking(null)}
      />

    </div>
  );
}

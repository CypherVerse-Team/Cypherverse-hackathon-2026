'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, ShieldCheck, CheckCircle2, ArrowRight, Zap, 
  MapPin, Clock, Award, Sparkles, ChevronLeft, ChevronRight,
  TrendingUp, Users, Shield
} from 'lucide-react';

const WORKER_FEATURE_CARDS = [
  {
    id: 'w-1',
    name: 'Rajesh Sharma',
    trade: 'Master Electrician',
    category: 'Home Maintenance',
    image: '/workers/electrician.jpg',
    rating: 4.9,
    reviews: 128,
    rate: '₹450/hr',
    city: 'Noida, NCR',
    experience: '8+ Years Exp',
    verified: true,
    tag: 'Trending Pro',
    searchParam: 'Electrician'
  },
  {
    id: 'w-2',
    name: 'Gurpreet Singh',
    trade: 'Master Plumber & Pipefitter',
    category: 'Home Maintenance',
    image: '/workers/plumber.jpg',
    rating: 4.8,
    reviews: 94,
    rate: '₹400/hr',
    city: 'Gurugram, NCR',
    experience: '6+ Years Exp',
    verified: true,
    tag: 'Quick Response',
    searchParam: 'Plumber'
  },
  {
    id: 'w-3',
    name: 'Dinesh Suthar',
    trade: 'Custom Woodwork Carpenter',
    category: 'Woodwork',
    image: '/workers/carpenter.jpg',
    rating: 4.95,
    reviews: 156,
    rate: '₹500/hr',
    city: 'Delhi Central',
    experience: '11+ Years Exp',
    verified: true,
    tag: 'Top Rated',
    searchParam: 'Carpenter'
  },
  {
    id: 'w-4',
    name: 'Rajendra Kumar',
    trade: 'Civil Construction Supervisor',
    category: 'Construction',
    image: '/workers/construction.jpg',
    rating: 4.9,
    reviews: 210,
    rate: '₹650/hr',
    city: 'Greater Noida',
    experience: '14+ Years Exp',
    verified: true,
    tag: 'Team Leader',
    searchParam: 'Construction'
  },
  {
    id: 'w-5',
    name: 'Sunil Kashyap',
    trade: 'Professional Wall Painter',
    category: 'Home Maintenance',
    image: '/workers/painter.jpg',
    rating: 4.75,
    reviews: 82,
    rate: '₹350/hr',
    city: 'Ghaziabad, NCR',
    experience: '5+ Years Exp',
    verified: true,
    tag: 'Eco Paints',
    searchParam: 'Painter'
  },
];

export default function AnimatedWorkerShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % WORKER_FEATURE_CARDS.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + WORKER_FEATURE_CARDS.length) % WORKER_FEATURE_CARDS.length);
  };

  return (
    <div ref={sectionRef} className="space-y-8 py-6">
      
      {/* Section Header with animated badge */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Featured Skilled Trades</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Meet Verified Labour Professionals
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Aadhaar verified, background checked, and rating audited trade workers ready for immediate on-demand and contract deployment.
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrev} 
            className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 hover:text-blue-600 shadow-sm transition-all hover:scale-105 active:scale-95"
            aria-label="Previous Worker"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={handleNext} 
            className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 hover:text-blue-600 shadow-sm transition-all hover:scale-105 active:scale-95"
            aria-label="Next Worker"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Interactive Animated Cards Slider / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {WORKER_FEATURE_CARDS.map((worker, idx) => {
          const isHighlight = idx === activeIdx;

          return (
            <div
              key={worker.id}
              onClick={() => setActiveIdx(idx)}
              style={{ transitionDelay: `${idx * 100}ms` }}
              className={`group relative rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between cursor-pointer ${
                isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
              } ${isHighlight ? 'ring-2 ring-blue-600 border-blue-600 shadow-md' : 'border-slate-200 hover:border-blue-300'}`}
            >
              {/* Worker Image Container with Zoom & Badge */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={worker.image}
                  alt={worker.name}
                  className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700"
                />
                
                {/* Floating Tag */}
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm border border-white/40 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                  {worker.rating}
                </span>

                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-sm flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  KYC Verified
                </span>

                {/* Dark Gradient Overlay at bottom of image */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                  <div className="text-xs font-bold truncate drop-shadow-sm">{worker.name}</div>
                  <div className="text-[10px] text-slate-200 truncate">{worker.trade}</div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Hourly Rate</span>
                    <span className="font-bold text-slate-900 font-mono">{worker.rate}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Location</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[100px]">{worker.city}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Experience</span>
                    <span className="font-semibold text-blue-600">{worker.experience}</span>
                  </div>
                </div>

                {/* Direct Search Link */}
                <Link
                  href={`/?q=${worker.searchParam}`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 border border-slate-200 hover:border-blue-600 group/btn shadow-2xs"
                >
                  <span>Find {worker.searchParam}s</span>
                  <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Animated Step-by-Step Trust Banner */}
      <div className={`rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black text-sm">
              01
            </div>
            <h4 className="font-bold text-sm text-white">Search & Filter</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Find qualified labour by trade, geolocation radius, rate, or skill verification level.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-sm">
              02
            </div>
            <h4 className="font-bold text-sm text-white">Instant Booking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Agree on schedule, project milestones, and transparent hourly or fixed quotation rates.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-sm">
              03
            </div>
            <h4 className="font-bold text-sm text-white">Escrow Payment</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Funds stay secure in platform escrow until work is delivered and verified satisfactory.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-black text-sm">
              04
            </div>
            <h4 className="font-bold text-sm text-white">Rated & Insured</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dispute resolution support, verified reviews, and quality guarantees for every booking.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

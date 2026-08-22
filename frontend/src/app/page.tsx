import { Search, MapPin, Star, ShieldCheck, CheckCircle2, ArrowRight, Shield, Award, Users, Layers, Sparkles, Filter, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import LandingHero from '@/components/LandingHero';
import { API_BASE_URL, cleanName } from '@/lib/api';

async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

async function getWorkers(searchParams: any) {
  try {
    const params = new URLSearchParams();
    
    const category = Array.isArray(searchParams?.category) ? searchParams.category[0] : searchParams?.category;
    if (category) params.append('category_id', category);
    
    const searchTerm = Array.isArray(searchParams?.q) ? searchParams.q[0] : (searchParams?.q || searchParams?.keyword || searchParams?.skill_name);
    if (searchTerm) {
      params.append('q', searchTerm);
    }
    
    const locationTerm = Array.isArray(searchParams?.city) ? searchParams.city[0] : (searchParams?.city || searchParams?.location);
    if (locationTerm) params.append('city', locationTerm);
    
    if (searchParams?.verified === 'true') params.append('verified_only', 'true');
    
    const res = await fetch(`${API_BASE_URL}/workers?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((worker: any) => ({
      id: worker.user_id,
      name: worker.full_name,
      profession: cleanName(worker.worker_profile?.skills?.length > 0 ? worker.worker_profile.skills[0].profession.name : (worker.worker_profile?.short_description || "Worker")),
      rating: worker.worker_profile?.average_rating || 4.8,
      jobs: worker.worker_profile?.completed_jobs || 12,
      distance: 3.5, 
      verified: worker.verification_status === "VERIFIED",
      hourly_rate: worker.worker_profile?.hourly_rate || 350,
      home_city: worker.worker_profile?.home_city || "Delhi NCR",
      status: worker.worker_profile?.availability_status || "AVAILABLE_NOW"
    }));
  } catch (error) {
    console.error("Failed to fetch workers:", error);
    return [];
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const workers = await getWorkers(resolvedSearchParams);
  const categories = await getCategories();

  // Helper for generating initials from worker name
  const getInitials = (name: string) => {
    if (!name) return 'W';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Helper colors for avatar circles
  const avatarGradients = [
    'from-blue-600 to-indigo-600',
    'from-purple-600 to-pink-600',
    'from-emerald-600 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-cyan-600 to-blue-700',
  ];

  // Create clean query string helper for links
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams();
    if (resolvedSearchParams && typeof resolvedSearchParams === 'object') {
      Object.entries(resolvedSearchParams).forEach(([key, val]) => {
        if (typeof key === 'string' && typeof val === 'string') {
          params.set(key, val);
        }
      });
    }
    if (value) params.set(name, value);
    else params.delete(name);
    return params.toString();
  };

  const isFiltered = Boolean(resolvedSearchParams.category || resolvedSearchParams.q || resolvedSearchParams.city || resolvedSearchParams.verified);

  return (
    <div className="space-y-12 py-2">
      
      {/* Sleek Landing Hero */}
      <LandingHero />

      {/* Popular Skilled Categories Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> Explore Skilled Trade Categories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Filter verified workers by trade profession</p>
          </div>
          <Link 
            href="/categories" 
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 group"
          >
            <span>View All Trade Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 10).map((cat: any, idx: number) => {
            const catName = cleanName(cat.name);
            const isSelected = resolvedSearchParams.category === cat.profession_id;

            return (
              <Link href={`/?${createQueryString('category', cat.profession_id)}`} key={cat.profession_id}>
                <div 
                  className={`p-5 rounded-2xl border text-center transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-md ring-2 ring-indigo-500/20' 
                      : 'bg-white border-slate-200/80 hover:border-indigo-300 shadow-xs'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center font-black text-lg text-white shadow-md bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} group-hover:scale-110 transition-transform`}>
                    {catName.charAt(0)}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                    {catName}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium mt-1 block">
                    {isSelected ? '✓ Selected' : 'Explore Trade'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Results Section */}
      <div className="space-y-6">
        
        {/* Header & Filter Controls Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {isFiltered ? 'Matching Skilled Workers' : 'Top Rated Verified Workers Nearby'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                {workers.length} Available
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant booking with escrow payment security
            </p>
          </div>

          {/* Action Filter Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Link 
              href={`/?${createQueryString('verified', resolvedSearchParams.verified === 'true' ? '' : 'true')}`} 
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all ${
                resolvedSearchParams.verified === 'true' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Only</span>
            </Link>

            {isFiltered && (
              <Link 
                href="/" 
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 flex items-center space-x-1 transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </Link>
            )}
          </div>
        </div>

        {/* Workers Grid */}
        {workers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 shadow-xs">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Workers Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
              We couldn't find any verified workers matching your exact category or filter criteria.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Clear Search Criteria</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker: any, idx: number) => {
              const initials = getInitials(worker.name);
              const grad = avatarGradients[idx % avatarGradients.length];

              return (
                <div 
                  key={worker.id} 
                  className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    
                    {/* Top Avatar & Status Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3.5">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} text-white font-black text-xl flex items-center justify-center shadow-md ring-2 ring-white group-hover:scale-105 transition-transform`}>
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {worker.name}
                            </h3>
                            {worker.verified && (
                              <span title="Govt & Skill Verified">
                                <ShieldCheck className="h-4 h-4 text-blue-600" />
                              </span>
                            )}
                          </div>
                          <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md mt-1">
                            {worker.profession}
                          </span>
                        </div>
                      </div>

                      {/* Availability Tag */}
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center ${
                        worker.status === 'AVAILABLE_NOW' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${worker.status === 'AVAILABLE_NOW' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                        {worker.status === 'AVAILABLE_NOW' ? 'Available' : 'Busy'}
                      </span>
                    </div>

                    {/* Stats Pill Row */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <Star className="h-4 w-4 text-amber-400 fill-current" />
                        <div>
                          <span className="font-bold text-slate-800">{worker.rating}</span>
                          <span className="text-slate-400 ml-1">({worker.jobs} jobs)</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-600 font-medium">
                        <MapPin className="h-4 w-4 text-indigo-500" />
                        <span className="truncate">{worker.home_city}</span>
                      </div>
                    </div>

                  </div>

                  {/* Card Footer Price & Action */}
                  <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-900">₹{worker.hourly_rate}</span>
                      <span className="text-slate-500 text-xs font-medium"> / hr</span>
                    </div>
                    <Link 
                      href={`/worker/${worker.id}`} 
                      className="bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all group-hover:scale-105"
                    >
                      View Profile & Book
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Platform Guarantee & How It Works Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Simple & Trustworthy</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">How ShramSetu Protects Every Booking</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-black text-lg flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="font-bold text-white text-sm">Find & Select Worker</h3>
            <p className="text-xs text-slate-300">Browse verified profiles, skill certifications, hourly rates, and customer reviews.</p>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-black text-lg flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="font-bold text-white text-sm">Escrow Secured Booking</h3>
            <p className="text-xs text-slate-300">Funds are held safely in escrow. Worker is notified and dispatched to your site.</p>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-black text-lg flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="font-bold text-white text-sm">Job Approval & Payout</h3>
            <p className="text-xs text-slate-300">Review completed work and release escrow payout to the worker seamlessly.</p>
          </div>
        </div>
      </div>

    </div>
  );
}


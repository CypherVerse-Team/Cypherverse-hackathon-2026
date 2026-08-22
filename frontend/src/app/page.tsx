import { Search, MapPin, Star, ShieldCheck, CheckCircle2, ArrowRight, Shield, Award, Users, Layers, Sparkles, Filter, RefreshCcw, Briefcase } from 'lucide-react';
import Link from 'next/link';
import LandingHero from '@/components/LandingHero';
import AnimatedWorkerShowcase from '@/components/AnimatedWorkerShowcase';
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

const getWorkerPhoto = (profession: string, idx: number) => {
  const p = (profession || '').toLowerCase();
  if (p.includes('electr')) return '/workers/electrician.jpg';
  if (p.includes('plumb')) return '/workers/plumber.jpg';
  if (p.includes('carpent') || p.includes('wood')) return '/workers/carpenter.jpg';
  if (p.includes('paint')) return '/workers/painter.jpg';
  if (p.includes('construct') || p.includes('mason') || p.includes('build') || p.includes('civil') || p.includes('welder')) return '/workers/construction.jpg';
  const defaultPhotos = [
    '/workers/electrician.jpg',
    '/workers/plumber.jpg',
    '/workers/carpenter.jpg',
    '/workers/construction.jpg',
    '/workers/painter.jpg',
  ];
  return defaultPhotos[idx % defaultPhotos.length];
};

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const workers = await getWorkers(resolvedSearchParams);
  const categories = await getCategories();

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

      {/* Animated Worker Showcase with Real Trade Images & Step Guide */}
      <AnimatedWorkerShowcase />

      {/* Popular Skilled Categories Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
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
          {categories.slice(0, 12).map((cat: any, idx: number) => {
            const catName = cleanName(cat.name);
            const isSelected = resolvedSearchParams.category === cat.profession_id;

            return (
              <Link href={`/?${createQueryString('category', cat.profession_id)}`} key={cat.profession_id}>
                <div 
                  className={`p-4 rounded-2xl border text-center transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-md ring-2 ring-indigo-500/20' 
                      : 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl mx-auto mb-2.5 flex items-center justify-center font-black text-base text-white shadow-md bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} group-hover:scale-110 transition-transform`}>
                    {catName.charAt(0)}
                  </div>
                  <h3 className="font-bold text-slate-800 text-xs group-hover:text-indigo-600 transition-colors truncate">
                    {catName}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block truncate">
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
              Instant booking with escrow payment security & verified KYC
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

        {/* Workers Grid with Real Worker Images */}
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
              const workerPhoto = getWorkerPhoto(worker.profession, idx);

              return (
                <div 
                  key={worker.id} 
                  className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Top Worker Image Banner */}
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={workerPhoto}
                        alt={worker.name}
                        className="w-full h-full object-cover object-top group-hover:scale-106 transition-transform duration-500"
                      />
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20" />

                      {/* Top floating badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-xs flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
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

                      {/* Bottom Image Details */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-white drop-shadow-sm truncate">
                            {worker.name}
                          </h3>
                          {worker.verified && (
                            <span title="Govt KYC & Skill Verified" className="text-blue-400">
                              <ShieldCheck className="h-4 w-4 fill-blue-500 text-white" />
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-indigo-200 font-medium truncate block">
                          {worker.profession}
                        </span>
                      </div>
                    </div>

                    {/* Card Information */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                          <span className="truncate max-w-[130px] font-medium">{worker.home_city}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Escrow Protected</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Price & Action */}
                  <div className="bg-slate-50/90 px-4 py-3.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black text-slate-900">₹{worker.hourly_rate}</span>
                      <span className="text-slate-500 text-xs font-medium"> / hr</span>
                    </div>
                    <Link 
                      href={`/worker/${worker.id}`} 
                      className="bg-slate-900 hover:bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all group-hover:scale-105"
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

    </div>
  );
}

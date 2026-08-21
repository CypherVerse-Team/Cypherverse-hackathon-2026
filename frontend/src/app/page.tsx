import { Search, MapPin, Star, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import LandingHero from '@/components/LandingHero';

async function getCategories() {
  try {
    const res = await fetch('http://localhost:8000/api/categories', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

async function getWorkers(searchParams: any) {
  try {
    const params = new URLSearchParams();
    if (searchParams.category) params.append('category_id', searchParams.category);
    if (searchParams.q) params.append('skill_name', searchParams.q);
    if (searchParams.city) params.append('city', searchParams.city);
    if (searchParams.verified === 'true') params.append('verified_only', 'true');
    
    const res = await fetch(`http://localhost:8000/api/workers?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((worker: any) => ({
      id: worker.user_id,
      name: worker.full_name,
      profession: worker.worker_profile?.skills?.length > 0 ? worker.worker_profile.skills[0].profession.name : (worker.worker_profile?.short_description || "Worker"),
      rating: worker.worker_profile?.average_rating || 0,
      jobs: worker.worker_profile?.completed_jobs || 0,
      distance: 5.0, 
      verified: worker.verification_status === "VERIFIED",
      hourly_rate: worker.worker_profile?.hourly_rate || 0,
      home_city: worker.worker_profile?.home_city || "Unknown",
      status: worker.worker_profile?.availability_status || "OFFLINE"
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

  return (
    <div className="space-y-8">
      <LandingHero />

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.slice(0, 6).map((cat: any) => (
          <Link href={`/?${createQueryString('category', cat.profession_id)}`} key={cat.profession_id}>
            <div className={`p-4 rounded-xl shadow-sm border text-center hover:border-blue-300 cursor-pointer transition-all ${resolvedSearchParams.category === cat.profession_id ? 'border-blue-500 bg-blue-50' : 'bg-white border-gray-100'}`}>
              <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center text-blue-600 font-bold text-xl">
                {cat.name.charAt(0)}
              </div>
              <h3 className="font-medium text-gray-800 text-sm">{cat.name}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Filters & Results Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {resolvedSearchParams.category || resolvedSearchParams.q ? 'Search Results' : 'Top Rated Workers Nearby'}
        </h2>
        <div className="flex space-x-2">
          <Link href={`/?${createQueryString('verified', resolvedSearchParams.verified === 'true' ? '' : 'true')}`} className={`px-4 py-2 rounded-full text-sm font-medium border ${resolvedSearchParams.verified === 'true' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}>
             Verified Only
          </Link>
          {(resolvedSearchParams.category || resolvedSearchParams.q || resolvedSearchParams.city) && (
            <Link href="/" className="px-4 py-2 rounded-full text-sm font-medium border bg-gray-50 border-gray-200 text-gray-700">
               Clear Filters
            </Link>
          )}
        </div>
      </div>

      {/* Workers Grid */}
      {workers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500">No workers found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker: any) => (
            <div key={worker.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-gray-900">{worker.name}</h3>
                      {worker.verified && <span title="Verified"><ShieldCheck className="h-5 w-5 text-blue-500" /></span>}
                    </div>
                    <p className="text-blue-600 font-medium text-sm">{worker.profession}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${worker.status === 'AVAILABLE_NOW' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {worker.status === 'AVAILABLE_NOW' ? 'Available' : 'Busy'}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium text-gray-700">{worker.rating}</span>
                    <span className="ml-1">({worker.jobs} jobs)</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {worker.distance} km away {worker.home_city ? `(${worker.home_city})` : ''}
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <div>
                    <span className="text-xl font-bold text-gray-900">₹{worker.hourly_rate || worker.price || 0}</span>
                    <span className="text-gray-500 text-sm">/hr</span>
                  </div>
                  <Link href={`/worker/${worker.id}`} className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { Star, MapPin, ShieldCheck, CheckCircle2, Clock, Phone, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import WorkerProfileBooking from '@/components/WorkerProfileBooking';
import WorkerLocationMap from '@/components/WorkerLocationMap';
import { API_BASE_URL, cleanName } from '@/lib/api';

async function getWorker(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/workers/${id}/profile`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.user.user_id,
      name: data.user.full_name,
      profession: cleanName(data.profile.skills?.length > 0 ? data.profile.skills[0].profession.name : (data.profile.short_description || "Worker")),
      skills: data.profile.skills?.map((s: any) => cleanName(s.profession.name)) || [],
      rating: data.profile.average_rating || 4.8,
      jobs: data.profile.completed_jobs || 12,
      distance: 3.5,
      verified: data.user.verification_status === "VERIFIED",
      price: data.profile.hourly_rate || data.profile.daily_rate || 350,
      unit: data.profile.hourly_rate ? "hr" : "day",
      status: data.profile.availability_status,
      about: data.profile.short_description || "Experienced skilled worker providing high-quality trade services with verified credentials.",
      home_city: data.profile.home_city || "Delhi NCR",
      address: data.profile.address || "Sector 62, Industrial Work Hub",
      latitude: data.profile.latitude ?? 28.6139,
      longitude: data.profile.longitude ?? 77.2090,
      service_radius_km: data.profile.service_radius_km || 10,
      experience: data.profile.years_of_experience || 5,
      reviews: []
    };
  } catch (e) {
    return null;
  }
}

export default async function WorkerProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const worker = await getWorker(resolvedParams.id);

  if (!worker) {
    return <div className="text-center py-20 text-gray-500 font-medium">Worker profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-blue-600 hover:underline text-sm font-semibold inline-flex items-center gap-1">
          &larr; Back to search directory
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Profile Header */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-8">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex-shrink-0 flex items-center justify-center text-4xl text-white font-black uppercase shadow-md ring-4 ring-slate-100">
            {worker.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                  {worker.name}
                  {worker.verified && <span title="Govt & Skill Verified"><ShieldCheck className="h-6 w-6 text-blue-600" /></span>}
                </h1>
                <p className="text-xl text-indigo-600 mt-1 font-bold">{worker.profession}</p>
                {worker.experience > 0 && <p className="text-sm text-slate-500 font-medium mt-0.5">{worker.experience} years of trade experience</p>}
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-slate-900">₹{worker.price}<span className="text-base text-slate-500 font-normal">/{worker.unit}</span></div>
                <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${worker.status === 'AVAILABLE_NOW' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {worker.status === 'AVAILABLE_NOW' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />}
                  {worker.status === 'AVAILABLE_NOW' ? 'Available to Book' : 'Currently Busy'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6 text-sm text-slate-600 font-medium">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-amber-400 fill-current mr-1" />
                <span className="font-bold text-slate-900 mr-1">{worker.rating}</span> 
                ({worker.jobs} completed jobs)
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-indigo-500 mr-1" />
                {worker.service_radius_km} km coverage ({worker.home_city})
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2">
              {worker.skills.map((skill: string) => (
                <span key={skill} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-8 border-r border-slate-100 space-y-8">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">About Worker</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{worker.about}</p>
            </div>

            {/* Location Map Section */}
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" /> Work Location & Coverage Area
              </h2>
              <WorkerLocationMap
                latitude={worker.latitude}
                longitude={worker.longitude}
                city={worker.home_city}
                address={worker.address}
                serviceRadiusKm={worker.service_radius_km}
                editable={false}
              />
            </div>
          </div>

          {/* Booking Action */}
          <div className="w-full md:w-80 p-8 bg-slate-50">
            <h3 className="font-extrabold text-slate-900 mb-4 text-base">Request Service</h3>
            
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-6 text-xs text-blue-900 flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-blue-600" />
              <p className="font-medium">Direct phone call & messaging are unlocked automatically after your booking request is accepted.</p>
            </div>

            <WorkerProfileBooking
              worker={{
                id: worker.id,
                name: worker.name,
                profession: worker.profession,
                hourly_rate: worker.price,
                home_city: worker.home_city,
                rating: worker.rating,
                verified: worker.verified
              }}
            />
            
          </div>
        </div>
      </div>
    </div>
  );
}

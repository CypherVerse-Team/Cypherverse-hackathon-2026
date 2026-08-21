import { Star, MapPin, ShieldCheck, CheckCircle2, Clock, Phone, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import BookingModal from '@/components/BookingModal';

async function getWorker(id: string) {
  try {
    const res = await fetch(`http://localhost:8000/api/workers/${id}/profile`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.user.user_id,
      name: data.user.full_name,
      profession: data.profile.skills?.length > 0 ? data.profile.skills[0].profession.name : (data.profile.short_description || "Worker"),
      skills: data.profile.skills?.map((s: any) => s.profession.name) || [],
      rating: data.profile.average_rating || 0,
      jobs: data.profile.completed_jobs || 0,
      distance: 5.0,
      verified: data.user.verification_status === "VERIFIED",
      price: data.profile.hourly_rate || data.profile.daily_rate || 0,
      unit: data.profile.hourly_rate ? "hr" : "day",
      status: data.profile.availability_status,
      about: data.profile.short_description || "Professional worker",
      home_city: data.profile.home_city,
      experience: data.profile.years_of_experience,
      reviews: []
    };
  } catch (e) {
    return null;
  }
}

export default async function WorkerProfile({ params }: { params: { id: string } }) {
  const worker = await getWorker(params.id);

  if (!worker) {
    return <div className="text-center mt-20">Worker not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">
          &larr; Back to search
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-8">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-4xl text-gray-500 font-bold uppercase">
            {worker.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  {worker.name}
                  {worker.verified && <span title="Verified Professional"><ShieldCheck className="h-6 w-6 text-blue-500 ml-2" /></span>}
                </h1>
                <p className="text-xl text-blue-600 mt-1 font-medium">{worker.profession}</p>
                {worker.experience > 0 && <p className="text-sm text-gray-500">{worker.experience} years of experience</p>}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">₹{worker.price}<span className="text-lg text-gray-500 font-normal">/{worker.unit}</span></div>
                <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${worker.status === 'AVAILABLE_NOW' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {worker.status === 'AVAILABLE_NOW' ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
                  {worker.status === 'AVAILABLE_NOW' ? 'Available to Book' : 'Currently Busy'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                <span className="font-bold text-gray-900 mr-1">{worker.rating}</span> 
                ({worker.jobs} completed jobs)
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-1" />
                {worker.distance} km away {worker.home_city ? `(${worker.home_city})` : ''}
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2">
              {worker.skills.map((skill: string) => (
                <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-8 border-r border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed mb-8">{worker.about}</p>
          </div>

          {/* Booking Action */}
          <div className="w-full md:w-80 p-8 bg-gray-50">
            <h3 className="font-bold text-gray-900 mb-4">Request Service</h3>
            
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 text-sm text-blue-800 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>For your privacy, direct calling is unlocked only after the booking is accepted.</p>
            </div>

            <BookingModal workerId={worker.id} basePrice={worker.price} />
            
          </div>
        </div>
      </div>
    </div>
  );
}

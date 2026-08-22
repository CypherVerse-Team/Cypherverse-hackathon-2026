'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { ShieldAlert, ShieldCheck, Save, Clock, Phone, MapPin } from 'lucide-react';
import AccountQuickHub from '@/components/AccountQuickHub';
import WorkerLocationMap from '@/components/WorkerLocationMap';

export default function WorkerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  
  const [formData, setFormData] = useState({
    profile_photo_url: '',
    gender: '',
    age: '',
    address: '',
    years_of_experience: 0,
    hourly_rate: 0,
    daily_rate: 0,
    short_description: '',
    home_city: '',
    service_radius_km: 10,
    latitude: 28.6139,
    longitude: 77.2090
  });

  const [verifyDocType, setVerifyDocType] = useState('AADHAAR');
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifyMsg, setVerifyMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [earnings, setEarnings] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !['WORKER', 'GROUP_LEADER'].includes(user?.account_type || ''))) {
      router.push('/');
    } else if (isAuthenticated && ['WORKER', 'GROUP_LEADER'].includes(user?.account_type || '')) {
      loadProfile();
      loadCategories();
      loadBookings();
      loadEarnings();
    }
  }, [isAuthenticated, user, isLoading, router]);

  const loadEarnings = async () => {
    try {
      const res = await fetchWithAuth('/v1/worker/earnings');
      if (res.ok) setEarnings(await res.json());
    } catch (e) {}
  };

  const loadBookings = async () => {
    try {
      const res = await fetchWithAuth('/v1/bookings/me');
      if (res.ok) setBookings(await res.json());
    } catch (e) {}
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetchWithAuth(`/v1/bookings/${bookingId}/status?status=${status}`, { method: 'PATCH' });
      if (res.ok) loadBookings();
      else {
        const error = await res.json();
        alert('Error: ' + error.detail);
      }
    } catch (e) {
      alert('Error updating status');
    }
  };



  const loadCategories = async () => {
    try {
      const res = await fetchWithAuth('/categories');
      if (res.ok) setCategories(await res.json());
    } catch (e) {}
  };

  const loadProfile = async () => {
    try {
      const res = await fetchWithAuth('/workers/me');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        if (data.worker_profile) {
          setFormData({
            profile_photo_url: data.worker_profile.profile_photo_url || '',
            gender: data.worker_profile.gender || '',
            age: data.worker_profile.age || '',
            address: data.worker_profile.address || '',
            years_of_experience: data.worker_profile.years_of_experience || 0,
            hourly_rate: data.worker_profile.hourly_rate || 0,
            daily_rate: data.worker_profile.daily_rate || 0,
            short_description: data.worker_profile.short_description || '',
            home_city: data.worker_profile.home_city || '',
            service_radius_km: data.worker_profile.service_radius_km || 10,
            latitude: data.worker_profile.latitude ?? 28.6139,
            longitude: data.worker_profile.longitude ?? 77.2090
          });
          if (data.worker_profile.skills) {
             setSelectedSkills(data.worker_profile.skills.map((s: any) => s.profession_id));
          }
        }
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  };

  const toggleSkill = (id: string) => {
    setSelectedSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMsg('');
    try {
      const res = await fetchWithAuth('/workers/me', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        // Save skills
        const skillsPayload = selectedSkills.map(id => ({ profession_id: id, skill_level: "INTERMEDIATE", is_primary_skill: false }));
        await fetchWithAuth('/workers/me/skills', {
          method: 'PUT',
          body: JSON.stringify(skillsPayload)
        });
        setSaveMsg('Profile saved successfully!');
        loadProfile();
      } else {
        const error = await res.json();
        setSaveMsg('Error: ' + error.detail);
      }
    } catch (e: any) {
      setSaveMsg('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyFile) {
        setVerifyMsg('Please select a document to upload.');
        return;
    }
    setVerifyMsg('');
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('document_type', verifyDocType);
      formData.append('file', verifyFile);

      const res = await fetchWithAuth('/v1/verification/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setVerifyMsg('Verification document uploaded successfully!');
        setVerifyFile(null);
        loadProfile(); // Reload to get updated user verification_status
      } else {
        const error = await res.json();
        setVerifyMsg('Error: ' + error.detail);
      }
    } catch (e: any) {
      setVerifyMsg('Error submitting verification document');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading || !profile) {
    return <div className="text-center mt-20">Loading Dashboard...</div>;
  }

  const vStatus = profile.verification_status;
  const isGroupLeader = user?.account_type === 'GROUP_LEADER';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
        {isGroupLeader && (
          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Group Leader
          </span>
        )}
      </div>

      <div className="flex space-x-4 border-b">
        <button onClick={() => setActiveTab('profile')} className={`pb-2 font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Profile & KYC</button>
        <button onClick={() => setActiveTab('location')} className={`pb-2 font-medium ${activeTab === 'location' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>📍 Work Location & Map</button>
        <button onClick={() => setActiveTab('bookings')} className={`pb-2 font-medium ${activeTab === 'bookings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>My Bookings</button>
        <button onClick={() => setActiveTab('earnings')} className={`pb-2 font-medium ${activeTab === 'earnings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Earnings</button>
        {isGroupLeader && (
          <button onClick={() => setActiveTab('team')} className={`pb-2 font-medium ${activeTab === 'team' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>My Team</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Account Quick Hub */}
        <div>
          <AccountQuickHub />
        </div>

        {/* Right Column: Main Tab Content */}
        <div className="lg:col-span-2">
          {activeTab === 'profile' && (
            <div className="space-y-8">
      
      {/* Verification Status Banner */}
      <div className={`p-4 rounded-xl border flex items-center ${
        vStatus === 'VERIFIED' ? 'bg-green-50 border-green-200 text-green-800' : 
        vStatus === 'PENDING' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
        vStatus === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-800' :
        'bg-gray-50 border-gray-200 text-gray-800'
      }`}>
        {vStatus === 'VERIFIED' ? <ShieldCheck className="h-6 w-6 mr-3" /> : 
         vStatus === 'PENDING' ? <Clock className="h-6 w-6 mr-3" /> :
         <ShieldAlert className="h-6 w-6 mr-3" />}
        <div>
          <h3 className="font-bold">Verification Status: {vStatus}</h3>
          {vStatus === 'UNVERIFIED' && <p className="text-sm">Please submit your documents to get verified and attract more customers.</p>}
          {vStatus === 'PENDING' && <p className="text-sm">Your documents are under review by an admin.</p>}
          {vStatus === 'REJECTED' && <p className="text-sm">Your verification was rejected. Please review and resubmit.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Editor */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h2>
          {saveMsg && <div className="mb-4 text-sm font-medium text-blue-600">{saveMsg}</div>}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" value={formData.home_city} onChange={e => setFormData({...formData, home_city: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.years_of_experience} onChange={e => setFormData({...formData, years_of_experience: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select className="w-full px-3 py-2 border rounded-lg" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.hourly_rate} onChange={e => setFormData({...formData, hourly_rate: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (₹)</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.daily_rate} onChange={e => setFormData({...formData, daily_rate: Number(e.target.value)})} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <textarea className="w-full px-3 py-2 border rounded-lg" rows={3} value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">My Services & Skills</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map(cat => (
                  <label key={cat.profession_id} className="flex items-center space-x-2 border p-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-600 focus:ring-blue-500" 
                      checked={selectedSkills.includes(cat.profession_id)}
                      onChange={() => toggleSkill(cat.profession_id)}
                    />
                    <span className="text-sm text-gray-700">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center">
              <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Verification Submit */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Submit KYC</h2>
            {(vStatus === 'UNVERIFIED' || vStatus === 'REJECTED') ? (
              <form onSubmit={handleSubmitVerification} className="space-y-4">
                {verifyMsg && <div className={`text-sm font-medium p-3 rounded-lg ${verifyMsg.includes('Error') || verifyMsg.includes('Please') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{verifyMsg}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={verifyDocType} onChange={e => setVerifyDocType(e.target.value)}>
                    <option value="ID_PROOF">ID Proof (Aadhaar/PAN)</option>
                    <option value="SKILL_CERTIFICATE">Skill Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document (Max 5MB)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      accept=".pdf,image/jpeg,image/png"
                      onChange={e => setVerifyFile(e.target.files?.[0] || null)} 
                    />
                    <div className="text-center pointer-events-none">
                      <div className="text-gray-500 mb-1">Drag and drop or click to upload</div>
                      <div className="text-xs text-gray-400">PDF, JPG, PNG</div>
                      {verifyFile && <div className="mt-2 text-sm font-bold text-blue-600">{verifyFile.name} ({(verifyFile.size / 1024 / 1024).toFixed(2)} MB)</div>}
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isUploading} className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  {isUploading ? 'Uploading...' : 'Submit Request'}
                </button>
              </form>
            ) : (
               <div className="text-gray-500 text-sm">
                 You have already submitted a verification request. Current status: <strong>{vStatus}</strong>
               </div>
            )}
          </div>
          </div>
        </div>
      )}

      {activeTab === 'location' && (
        <div className="space-y-6">
          <WorkerLocationMap
            latitude={formData.latitude}
            longitude={formData.longitude}
            city={formData.home_city}
            address={formData.address}
            serviceRadiusKm={formData.service_radius_km}
            editable={true}
            onSaveLocation={async (loc) => {
              const updated = {
                ...formData,
                home_city: loc.home_city,
                address: loc.address,
                service_radius_km: loc.service_radius_km,
                latitude: loc.latitude,
                longitude: loc.longitude
              };
              setFormData(updated);
              const res = await fetchWithAuth('/workers/me', {
                method: 'PUT',
                body: JSON.stringify(updated)
              });
              if (res.ok) {
                loadProfile();
              }
            }}
          />
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Service Requests</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-10 text-gray-500 border border-dashed rounded-xl">
              No service requests yet.
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map(b => {
                const hasInProgress = bookings.some(bk => bk.booking_status === 'IN_PROGRESS');
                
                const steps = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
                let activeIndex = steps.indexOf(b.booking_status);
                if (b.booking_status === 'WAITING') activeIndex = 0;

                return (
                <div key={b.booking_id} className="border rounded-xl p-6 flex flex-col">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-bold text-gray-900 text-lg">Customer: {b.customer?.name || "Unknown"}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          b.booking_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          b.booking_status === 'WAITING' ? 'bg-orange-100 text-orange-800' :
                          b.booking_status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                          b.booking_status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800' :
                          b.booking_status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {b.booking_status}
                        </span>
                        {b.price_locked && (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 border font-medium">Price Locked</span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(b.scheduled_date).toLocaleString()}
                        </div>
                        {b.duration_type && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {b.duration_type}
                          </div>
                        )}
                        <div className="flex items-center font-medium text-gray-900">
                          ₹{b.agreed_amount}
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <strong>Service Address:</strong> {b.service_address_id}
                      </div>

                      {/* Contact Actions */}
                      <div className="mt-4 flex items-center space-x-2">
                        {b.customer?.mobile_number?.includes('XXX') ? (
                          <div className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm flex items-center">
                            <Phone className="w-4 h-4 mr-2" /> Phone number hidden until accepted
                          </div>
                        ) : (
                          <a href={`tel:${b.customer?.mobile_number}`} className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-bold flex items-center transition-colors">
                            <Phone className="w-4 h-4 mr-2" /> Call {b.customer?.mobile_number}
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 w-full md:w-auto mt-4 md:mt-0">
                      {b.booking_status === 'PENDING' && (
                        <>
                          <button onClick={() => updateBookingStatus(b.booking_id, 'ACCEPTED')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm">
                            Accept Now
                          </button>
                          {hasInProgress && (
                            <button onClick={() => {
                              // Optional: you could show a modal for estimated time, currently just auto-accepting into WAITING
                              if(confirm('Accept this request into your WAITING queue?')) {
                                updateBookingStatus(b.booking_id, 'WAITING');
                              }
                            }} className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-2 rounded-lg font-medium text-sm">
                              Add to Wait Queue
                            </button>
                          )}
                          <button onClick={() => updateBookingStatus(b.booking_id, 'REJECTED')} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium text-sm">
                            Reject
                          </button>
                        </>
                      )}
                      {b.booking_status === 'WAITING' && (
                        <button onClick={() => updateBookingStatus(b.booking_id, 'ACCEPTED')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm">
                          Ready to Accept
                        </button>
                      )}
                      {b.booking_status === 'ACCEPTED' && (
                        <button onClick={() => updateBookingStatus(b.booking_id, 'IN_PROGRESS')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm">
                          Start Job
                        </button>
                      )}
                      {b.booking_status === 'IN_PROGRESS' && (
                        <button onClick={() => updateBookingStatus(b.booking_id, 'COMPLETED')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm">
                          Complete Job
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    {['REJECTED', 'CANCELLED'].includes(b.booking_status) ? (
                      <div className="text-red-500 font-medium text-sm mt-4">Booking was {b.booking_status.toLowerCase()}</div>
                    ) : (
                      <div className="mt-6 flex items-center w-full max-w-xl">
                        {steps.map((step, idx) => (
                          <div key={step} className="flex-1 flex flex-col items-center relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 
                              ${idx <= activeIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                              {idx + 1}
                            </div>
                            <div className="text-xs font-medium text-gray-500 mt-2 text-center w-max">{step.replace('_', ' ')}</div>
                            {idx < steps.length - 1 && (
                              <div className={`absolute top-4 left-1/2 w-full h-1 -z-0
                                ${idx < activeIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Earnings & Payouts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <div className="text-sm font-medium text-green-800 mb-2">Total Earnings</div>
              <div className="text-3xl font-black text-green-900">₹{earnings?.total_earnings?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="text-sm font-medium text-blue-800 mb-2">This Month</div>
              <div className="text-3xl font-black text-blue-900">₹{earnings?.monthly_earnings?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <div className="text-sm font-medium text-indigo-800 mb-2">Completed Jobs</div>
              <div className="text-3xl font-black text-indigo-900">{earnings?.completed_jobs || 0}</div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payout Account Configuration</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-lg">
               <p className="text-sm text-gray-600 mb-4">Set up your UPI ID or Bank Account to receive automatic payouts for digital payments.</p>
               <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm">
                 Add Payout Account
               </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && isGroupLeader && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Team Management</h2>
          <div className="text-center py-10 text-gray-500 border border-dashed rounded-xl">
             Team Management capabilities enabled. You can register your crew, add workers via mobile number, and receive bulk project requests directly here.
             <br/><br/>
             <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Create / Manage Team</button>
          </div>
        </div>
      )}

        </div>
      </div>
    </div>
  );
}

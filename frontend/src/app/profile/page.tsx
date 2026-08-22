'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth, API_BASE_URL, cleanName } from '@/lib/api';
import { User, Phone, MapPin, ShieldCheck, Briefcase, DollarSign, Edit3, CheckCircle2, AlertCircle, Building, Award, Settings, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import AccountQuickHub from '@/components/AccountQuickHub';

export default function ProfilePage() {
  const { user, isAuthenticated, login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | string>(350);
  const [yearsExperience, setYearsExperience] = useState<number | string>(3);
  const [shortDesc, setShortDesc] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProfessionId, setSelectedProfessionId] = useState('');
  const [userSkills, setUserSkills] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      // Load current user full profile details
      const res = await fetchWithAuth('/auth/me');
      if (res.ok) {
        const data = await res.json();
        setFullName(data.full_name || '');
        setMobileNumber(data.mobile_number || '');

        if (data.worker_profile) {
          setHomeCity(data.worker_profile.home_city || '');
          setHourlyRate(data.worker_profile.hourly_rate || 350);
          setYearsExperience(data.worker_profile.years_of_experience || 0);
          setShortDesc(data.worker_profile.short_description || '');
        }

        if (data.contractor_profile) {
          setCompanyName(data.contractor_profile.company_name || '');
        }
      }

      // Load skill categories
      const catRes = await fetch(`${API_BASE_URL}/categories`);
      if (catRes.ok) {
        const cats = await catRes.json();
        setCategories(cats);
        if (cats.length > 0) setSelectedProfessionId(cats[0].profession_id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setIsSaving(true);

    try {
      const res = await fetchWithAuth('/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          mobile_number: mobileNumber,
          home_city: homeCity,
          hourly_rate: Number(hourlyRate),
          years_of_experience: Number(yearsExperience),
          short_description: shortDesc,
          company_name: companyName
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to update profile');
      }

      const data = await res.json();
      
      // Update primary skill if worker selected a trade
      if (user?.account_type === 'WORKER' && selectedProfessionId) {
        await fetchWithAuth('/workers/me/skills', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([
            {
              profession_id: selectedProfessionId,
              skill_level: 'INTERMEDIATE',
              is_primary_skill: true
            }
          ])
        });
      }

      // Refresh Auth context
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && data.user) login(token, data.user);
      }

      setMsg({ type: 'success', text: 'Profile details modified and saved successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error updating profile' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <User className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Profile & Settings</h2>
        <p className="text-gray-600 mb-6">Please log in to view and modify your account details, skills, and settings.</p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm inline-block">
          Log In Now
        </Link>
      </div>
    );
  }

  const roleBadgeColor = {
    CUSTOMER: 'bg-purple-100 text-purple-800 border-purple-200',
    WORKER: 'bg-blue-100 text-blue-800 border-blue-200',
    GROUP_LEADER: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    CONTRACTOR: 'bg-amber-100 text-amber-800 border-amber-200',
    ADMIN: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  }[user?.account_type || 'CUSTOMER'];

  return (
    <div className="space-y-6">
      {/* Clean Profile Header Card (Drawoi Admin Style) */}
      <div className="bg-zinc-900 rounded-3xl p-6 shadow-md border border-zinc-800">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-blue-500/20">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{user?.full_name}</h1>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${roleBadgeColor}`}>
                {user?.account_type}
              </span>
              {(user?.verification_status === 'VERIFIED' || user?.verification_status === true) && (
                <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Verified User
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-xs mt-1.5 flex items-center justify-center sm:justify-start font-medium">
              <Phone className="w-3.5 h-3.5 mr-1 text-zinc-500" /> Mobile: {user?.mobile_number}
            </p>
          </div>
        </div>
      </div>

          {msg && (
            <div className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-semibold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Profile Modification Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Modify Account Details</h2>
                <p className="text-xs text-slate-500 font-medium">Update contact details, trade skills, home city, and rates</p>
              </div>
            </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Details */}
            {user?.account_type === 'WORKER' && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Worker Profile Details</h3>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Primary Skill Trade</label>
                  <select
                    value={selectedProfessionId}
                    onChange={(e) => setSelectedProfessionId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {categories.map((c: any) => (
                      <option key={c.profession_id} value={c.profession_id}>
                        {cleanName(c.name)} ({c.category || 'Trade'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Hourly Rate (₹/hr)</label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Home City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi NCR, Mumbai"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Short Description / Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your skills and experience..."
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            {user?.account_type === 'CONTRACTOR' && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contractor Business Details</h3>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-sm transition-all shadow-md mt-6"
            >
              {isSaving ? 'Saving Changes...' : 'Save & Update Profile'}
            </button>
          </form>
        </div>

    </div>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchWithAuth, API_BASE_URL, cleanName } from '@/lib/api';
import { Phone, Lock, Eye, EyeOff, Loader2, ArrowRight, UserCheck, ShieldCheck, MapPin, DollarSign, Briefcase, CheckCircle2, Building, Sparkles } from 'lucide-react';
import Link from 'next/link';

function AuthForm() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<'AUTH' | 'DETAILS'>('AUTH');

  // Login & Register fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<'CUSTOMER' | 'WORKER' | 'CONTRACTOR'>('CUSTOMER');

  // Post-Signin / Signup Required Details Fields
  const [homeCity, setHomeCity] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | string>(350);
  const [yearsExperience, setYearsExperience] = useState<number | string>(3);
  const [shortDesc, setShortDesc] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedProfessionId, setSelectedProfessionId] = useState('');

  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedUser, setSavedUser] = useState<any>(null);

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Load categories for required details onboarding
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setCategories(data);
        if (data.length > 0) setSelectedProfessionId(data[0].profession_id);
      })
      .catch(() => {});
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authMode === 'register') {
        // Submit Registration
        const res = await fetchWithAuth('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            full_name: fullName,
            mobile_number: mobileNumber,
            password,
            account_type: accountType
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Registration failed');
        }

        // Auto login after registration
        const loginRes = await fetchWithAuth('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ mobile_number: mobileNumber, password }),
        });

        if (!loginRes.ok) {
          throw new Error('Registration successful! Please log in.');
        }

        const loginData = await loginRes.json();
        login(loginData.access_token, loginData.user);
        setSavedUser(loginData.user);
        
        // Move to Step 2: Details Form
        setStep('DETAILS');
      } else {
        // Submit Login
        const res = await fetchWithAuth('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ mobile_number: mobileNumber, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Incorrect mobile number or password');
        }

        const data = await res.json();
        login(data.access_token, data.user);
        setSavedUser(data.user);

        // Prompt details step or redirect
        if (data.user.account_type === 'WORKER' || data.user.account_type === 'CONTRACTOR') {
          setStep('DETAILS');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (savedUser?.account_type === 'WORKER') {
        // Update Worker Profile
        const profileRes = await fetchWithAuth('/workers/me', {
          method: 'PUT',
          body: JSON.stringify({
            home_city: homeCity || 'Delhi NCR',
            hourly_rate: Number(hourlyRate) || 350,
            years_of_experience: Number(yearsExperience) || 2,
            short_description: shortDesc || 'Verified skilled technician'
          }),
        });

        if (!profileRes.ok) {
          const data = await profileRes.json();
          throw new Error(data.detail || 'Failed to update profile details');
        }

        // Update Skill if profession selected
        if (selectedProfessionId) {
          await fetchWithAuth('/workers/me/skills', {
            method: 'PUT',
            body: JSON.stringify([
              {
                profession_id: selectedProfessionId,
                skill_level: 'INTERMEDIATE',
                is_primary_skill: true
              }
            ])
          });
        }

        router.push('/worker-dashboard');
      } else if (savedUser?.account_type === 'CONTRACTOR') {
        router.push('/contractor');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipDetails = () => {
    if (savedUser?.account_type === 'WORKER' || savedUser?.account_type === 'GROUP_LEADER') {
      router.push('/worker-dashboard');
    } else if (savedUser?.account_type === 'CONTRACTOR') {
      router.push('/contractor');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] py-8 px-4 sm:px-6">
      <div className="w-full max-w-xl bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 transition-all duration-300">
        
        {/* STEP 1: AUTHENTICATION (LOGIN & SIGNUP TOGGLE) */}
        {step === 'AUTH' && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-500/30">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ShramSetu Account</h1>
              <p className="text-sm text-gray-500 mt-2">Log in or sign up to access digital workforce services</p>
            </div>

            {/* Toggle Tabs: Login vs Register */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 font-semibold text-sm">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all duration-200 text-center ${
                  authMode === 'login'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all duration-200 text-center ${
                  authMode === 'register'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create Account (Sign Up)
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm flex items-start space-x-2">
                <span className="font-semibold text-red-800">Alert:</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              {/* Full Name for Signup */}
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              {/* Account Role Selector for Signup */}
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">I am registering as a...</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'CUSTOMER', label: 'Customer', sub: 'Hire Workers' },
                      { id: 'WORKER', label: 'Worker', sub: 'Provide Services' },
                      { id: 'CONTRACTOR', label: 'Contractor', sub: 'Manage Crews' },
                    ].map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setAccountType(r.id as any)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          accountType === r.id
                            ? 'border-blue-500 bg-blue-50/80 text-blue-700 shadow-sm font-bold'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{r.label}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{r.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Mobile Number</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter mobile number (+91...)"
                    className="block w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    className="block w-full rounded-xl border border-gray-200 pl-10 pr-10 py-3 text-gray-900 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all duration-150 active:scale-[0.98] disabled:bg-blue-400 mt-6 text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Log In & Continue' : 'Sign Up & Setup Profile'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: REQUIRED DETAILS ONBOARDING FORM */}
        {step === 'DETAILS' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-3 font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">Complete Your Required Profile Details</h2>
              <p className="text-xs text-gray-500 mt-1">
                Help clients and teams find you quickly by providing key profile information.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveDetails} className="space-y-4">
              {savedUser?.account_type === 'WORKER' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Primary Trade / Skill Category</label>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Hourly Rate (₹/hr)</label>
                      <input
                        type="number"
                        placeholder="e.g. 350"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Years of Experience</label>
                      <input
                        type="number"
                        placeholder="e.g. 4"
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Home City / Primary Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhi NCR, Mumbai, Bengaluru"
                      value={homeCity}
                      onChange={(e) => setHomeCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Short Description / Bio</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe your specialties and working experience..."
                      value={shortDesc}
                      onChange={(e) => setShortDesc(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </>
              )}

              {savedUser?.account_type === 'CONTRACTOR' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Infrastructure Contractors"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              )}

              {savedUser?.account_type === 'CUSTOMER' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Primary City / City Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi, Gurgaon, Noida"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-sm transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Save Profile & Enter Platform</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSkipDetails}
                  className="w-full text-xs text-gray-500 hover:text-gray-800 font-semibold py-2 text-center"
                >
                  Skip for Now & Go to Dashboard &rarr;
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default function UnifiedAuthPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20 text-gray-500 text-sm font-medium">
        Loading ShramSetu Auth...
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}


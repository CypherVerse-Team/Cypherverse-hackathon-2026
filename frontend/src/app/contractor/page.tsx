'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api';
import { Users, HardHat, Plus, CheckCircle, Briefcase, Calendar, UserPlus, AlertCircle, Building2 } from 'lucide-react';
import Link from 'next/link';

import AccountQuickHub from '@/components/AccountQuickHub';

export default function ContractorPage() {
  const { user, isAuthenticated } = useAuth();
  
  // State for Teams (Group Leaders)
  const [team, setTeam] = useState<any>(null);
  const [teamName, setTeamName] = useState('');
  const [primaryProfession, setPrimaryProfession] = useState('Construction');
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [memberMobile, setMemberMobile] = useState('');
  
  // State for Contractors (Bulk Requests)
  const [bulkRequests, setBulkRequests] = useState<any[]>([]);
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reqProfession, setReqProfession] = useState('Electrician');
  const [reqQty, setReqQty] = useState(5);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.account_type === 'GROUP_LEADER' || user?.account_type === 'WORKER') {
        const res = await fetchWithAuth('/v1/teams/my-team');
        if (res.ok) setTeam(await res.json());
      }
      if (user?.account_type === 'CONTRACTOR' || user?.account_type === 'ADMIN') {
        const res = await fetchWithAuth('/v1/contractors/bulk-requests');
        if (res.ok) setBulkRequests(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetchWithAuth('/v1/teams/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName,
          primary_profession: primaryProfession,
          max_capacity: Number(maxCapacity)
        })
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Team created successfully!' });
        loadData();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.detail || 'Failed to create team' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error occurred' });
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    setMsg(null);
    try {
      const res = await fetchWithAuth(`/v1/teams/${team.team_id}/members?worker_mobile=${encodeURIComponent(memberMobile)}`, {
        method: 'POST'
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Worker added to team!' });
        setMemberMobile('');
        loadData();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.detail || 'Failed to add member' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error occurred' });
    }
  };

  const handleCreateBulkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetchWithAuth('/v1/contractors/bulk-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: projectName,
          start_date: startDate || new Date().toISOString(),
          end_date: endDate || new Date(Date.now() + 864000000).toISOString(),
          requirements: [{ profession: reqProfession, quantity: Number(reqQty) }]
        })
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Bulk Workforce Request submitted!' });
        setProjectName('');
        loadData();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.detail || 'Failed to submit request' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error occurred' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contractor & Team Management Hub</h2>
        <p className="text-gray-600 mb-6">Please log in as a Contractor or Group Leader to manage work teams and submit bulk workforce requests.</p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm inline-block">
          Log In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-3">
              <Building2 className="w-3.5 h-3.5 mr-1" /> Enterprise Workforce Management
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Contractor & Team Hub</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage large scale work crews, contractor teams, and bulk project deployments.
            </p>
          </div>
          <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-right">
            <span className="text-xs text-slate-400 block">Logged in as</span>
            <span className="text-sm font-bold text-white">{user?.full_name} ({user?.account_type})</span>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {msg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Account Quick Hub */}
        <div>
          <AccountQuickHub />
        </div>

        {/* Right Column: Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
        
        {/* TEAM MANAGEMENT SECTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Work Crew Team</h2>
                <p className="text-xs text-gray-500">Group leaders can register workers and manage crew members</p>
              </div>
            </div>

            {team ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{team.name}</h3>
                    <p className="text-xs text-gray-500">{team.primary_profession} • Capacity: {team.members?.length || 0}/{team.max_capacity} workers</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-extrabold rounded-full">Active Team</span>
                </div>

                {/* Add Member Form */}
                <form onSubmit={handleAddMember} className="flex gap-2 pt-2">
                  <input 
                    type="text" 
                    placeholder="Enter Worker Mobile Number to add..."
                    value={memberMobile}
                    onChange={(e) => setMemberMobile(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center">
                    <UserPlus className="w-4 h-4 mr-1" /> Add Member
                  </button>
                </form>

                {/* Team Members List */}
                <div className="pt-2 space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Crew Members</h4>
                  <div className="divide-y divide-gray-100 bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                    {team.members?.map((m: any, idx: number) => (
                      <div key={m.member_id || idx} className="flex justify-between items-center text-xs py-1">
                        <div className="font-medium text-gray-800">
                          {m.worker_profile?.user?.full_name || `Member ID: ${m.worker_profile_id.substring(0, 8)}...`}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold ${m.role === 'LEADER' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Team Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Apex Construction Crew"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Primary Profession</label>
                    <select 
                      value={primaryProfession}
                      onChange={(e) => setPrimaryProfession(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Construction">Construction</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Painter">Painter</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="Tractor Driver">Tractor Driver</option>
                      <option value="Cleaner / Sweeper">Cleaner / Sweeper</option>
                      <option value="House Help / Maid">House Help / Maid</option>
                      <option value="Daily Wage Labourer">Daily Wage Labourer</option>
                      <option value="Construction Worker">Construction Worker</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Max Workers</label>
                    <input 
                      type="number" 
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      min={2}
                      max={50}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-1.5" /> Register New Team
                </button>
              </form>
            )}
          </div>

        {/* CONTRACTOR BULK REQUESTS SECTION */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Bulk Workforce Requests</h2>
                <p className="text-xs text-gray-500">Submit multi-worker hiring requirements for commercial projects</p>
              </div>
            </div>

            <form onSubmit={handleCreateBulkRequest} className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Project Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Metro Station Electric Wiring Project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Required Profession</label>
                  <select 
                    value={reqProfession}
                    onChange={(e) => setReqProfession(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Painter">Painter</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Mason">Mason</option>
                    <option value="Welder">Welder</option>
                    <option value="Tractor Driver">Tractor Driver</option>
                    <option value="Cleaner / Sweeper">Cleaner / Sweeper</option>
                    <option value="House Help / Maid">House Help / Maid</option>
                    <option value="Daily Wage Labourer">Daily Wage Labourer</option>
                    <option value="Construction Worker">Construction Worker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Worker Count Required</label>
                  <input 
                    type="number" 
                    value={reqQty}
                    onChange={(e) => setReqQty(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    min={1}
                    max={100}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center">
                <Briefcase className="w-4 h-4 mr-1.5" /> Submit Bulk Request
              </button>
            </form>

            {/* List of Previous Bulk Requests */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3">Submitted Bulk Requests</h4>
              {bulkRequests.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  No bulk requests submitted yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {bulkRequests.map((req: any) => (
                    <div key={req.request_id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-sm">{req.project_name}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${req.status === 'ASSIGNED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="text-gray-500 flex items-center space-x-3">
                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(req.created_at).toLocaleDateString()}</span>
                        <span>{req.requirements?.length || 0} skill role(s) requested</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_ORIGIN, fetchWithAuth } from '@/lib/api';
import {
  Users, Briefcase, IndianRupee, ShieldAlert,
  CheckCircle, XCircle, Eye, BarChart2, MessageSquareWarning,
  Layers, TrendingUp, ShieldCheck, Clock, AlertTriangle,
  ChevronRight, RefreshCw, UserCog, X, Search, Plus,
  Building, Check, Ban, Filter, Grid
} from 'lucide-react';
import SummaryStatsCard from '@/components/SummaryStatsCard';

const TABS = [
  { id: 'overview',       label: 'Overview',          icon: BarChart2 },
  { id: 'workers',        label: 'Manage Workers',    icon: Briefcase },
  { id: 'customers',      label: 'Manage Customers',  icon: Users },
  { id: 'contractors',    label: 'Manage Contractors',icon: Building },
  { id: 'works',          label: 'Manage Works',      icon: CheckCircle },
  { id: 'verifications',  label: 'Worker KYC Status', icon: ShieldCheck },
  { id: 'categories',     label: 'Manage Categories', icon: Grid },
  { id: 'complaints',     label: 'Complaints',        icon: MessageSquareWarning },
  { id: 'matchmaking',    label: 'Bulk Matchmaking',  icon: Layers },
  { id: 'financials',     label: 'Financials',        icon: TrendingUp },
  { id: 'stats',          label: 'Summary Stats',     icon: BarChart2 },
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    ACTIVE:        'bg-green-50 text-green-700 border border-green-200',
    SUSPENDED:     'bg-red-50 text-red-700 border border-red-200',
    PENDING:       'bg-amber-50 text-amber-700 border border-amber-200',
    VERIFIED:      'bg-green-50 text-green-700 border border-green-200',
    UNVERIFIED:    'bg-gray-100 text-gray-600 border border-gray-200',
    REJECTED:      'bg-red-50 text-red-700 border border-red-200',
    SUBMITTED:     'bg-red-50 text-red-700 border border-red-200',
    INVESTIGATING: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    RESOLVED:      'bg-green-50 text-green-700 border border-green-200',
    CLOSED:        'bg-gray-100 text-gray-600 border border-gray-200',
    ASSIGNED:      'bg-blue-50 text-blue-700 border border-blue-200',
    COMPLETED:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
    IN_PROGRESS:   'bg-blue-50 text-blue-700 border border-blue-200',
    CANCELLED:     'bg-gray-100 text-gray-500 border border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

function AdminDashboardContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(tabFromQuery || 'overview');
  const [stats, setStats] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [bulkRequests, setBulkRequests] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatGroup, setNewCatGroup] = useState('Home Maintenance');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Modals & Action States
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resolveComplaintId, setResolveComplaintId] = useState<string | null>(null);
  const [assignBulkId, setAssignBulkId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'error' | 'success' } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (tabFromQuery) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAll = async () => {
    setRefreshing(true);
    try {
      const [sRes, uRes, bRes, vRes, cRes, mRes, fRes, catRes] = await Promise.all([
        fetchWithAuth('/admin/stats'),
        fetchWithAuth('/admin/users'),
        fetchWithAuth('/admin/bookings'),
        fetchWithAuth('/v1/admin/verification/queue'),
        fetchWithAuth('/v1/complaints/admin'),
        fetchWithAuth('/v1/contractors/admin/matchmaking'),
        fetchWithAuth('/v1/admin/financial-overview'),
        fetchWithAuth('/categories'),
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (uRes.ok) setAllUsers(await uRes.json());
      if (bRes.ok) setBookings(await bRes.json());
      if (vRes.ok) setVerifications(await vRes.json());
      if (cRes.ok) setComplaints(await cRes.json());
      if (mRes.ok) setBulkRequests(await mRes.json());
      if (fRes.ok) setFinancials(await fRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.account_type !== 'ADMIN')) {
      router.push('/');
    } else if (isAuthenticated) {
      loadAll();
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleVerify = async (requestId: string, status: string, reasonStr = '') => {
    setIsProcessing(true);
    try {
      let url = `/v1/admin/verification/${requestId}/review?status=${status}`;
      if (reasonStr) url += `&reason=${encodeURIComponent(reasonStr)}`;
      const res = await fetchWithAuth(url, { method: 'PATCH' });
      if (res.ok) {
        showToast(`KYC successfully marked as ${status}`, 'success');
        setRejectId(null); setReason('');
        loadAll();
      } else {
        const err = await res.json();
        showToast(err.detail || 'Error updating status', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setIsProcessing(false); }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetchWithAuth(`/admin/users/${userId}/status?status=${nextStatus}`, { method: 'PATCH' });
      if (res.ok) {
        showToast(`User status updated to ${nextStatus}`, 'success');
        loadAll();
      }
    } catch { showToast('Failed to update status', 'error'); }
  };

  const handleToggleUserVerify = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'VERIFIED' ? 'UNVERIFIED' : 'VERIFIED';
    try {
      const res = await fetchWithAuth(`/admin/users/${userId}/verify?status=${nextStatus}`, { method: 'PATCH' });
      if (res.ok) {
        showToast(`User verification updated to ${nextStatus}`, 'success');
        loadAll();
      }
    } catch { showToast('Failed to update verification', 'error'); }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetchWithAuth(`/admin/bookings/${bookingId}/status?status=${status}`, { method: 'PATCH' });
      if (res.ok) {
        showToast(`Work status updated to ${status}`, 'success');
        loadAll();
      }
    } catch { showToast('Failed to update work status', 'error'); }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetchWithAuth('/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: newCatName.trim(),
          category: newCatGroup,
          description: newCatDesc.trim() || `Professional ${newCatName} services`
        })
      });
      if (res.ok) {
        showToast(`Category "${newCatName}" created!`, 'success');
        setNewCatName('');
        setNewCatDesc('');
        loadAll();
      } else {
        const err = await res.json();
        showToast(err.detail || 'Failed to create category', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  // Filtered lists
  const workers = allUsers.filter(u => ['WORKER', 'GROUP_LEADER'].includes(u.account_type))
    .filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.mobile_number?.includes(searchQuery));
  
  const customers = allUsers.filter(u => u.account_type === 'CUSTOMER')
    .filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.mobile_number?.includes(searchQuery));

  const contractors = allUsers.filter(u => u.account_type === 'CONTRACTOR')
    .filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.mobile_number?.includes(searchQuery));

  const filteredBookings = bookings.filter(b => 
    b.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.worker_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.booking_status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const kpiCards = [
    { label: 'Total Workers',   value: stats.total_workers,   sub: 'Registered workers',  icon: Briefcase,   light: 'bg-blue-50',   text: 'text-blue-600' },
    { label: 'Total Customers', value: stats.total_customers, sub: 'Service buyers',      icon: Users,       light: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: 'Total Works / Jobs',value: stats.total_bookings,sub: 'Completed & active', icon: CheckCircle, light: 'bg-green-50',  text: 'text-green-600' },
    { label: 'Pending KYC',     value: stats.pending_verifications, sub: 'In review queue',icon: ShieldAlert,light: 'bg-orange-50',text: 'text-orange-600' },
  ];

  return (
    <div className="space-y-5 relative">

      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Admin Control Center</h1>
          <p className="text-gray-500 text-sm">Manage platform workers, customers, contractors, works, KYC status, and categories</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAll}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all bg-white"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
            <div className={`${card.light} p-3 rounded-lg flex-shrink-0`}>
              <card.icon size={20} className={card.text} />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold text-gray-900 leading-tight">{card.value ?? '0'}</div>
              <div className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Canvas */}
      <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

          {/* ── 1. OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="p-5 space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Platform Quick Actions & Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Manage Workers', count: workers.length, note: 'Manage verified workforce', icon: Briefcase, action: () => setActiveTab('workers'), color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Worker KYC Status', count: verifications.length, note: 'Pending ID review', icon: ShieldCheck, action: () => setActiveTab('verifications'), color: 'text-orange-600', bg: 'bg-orange-50' },
                  { label: 'Manage Works / Jobs', count: bookings.length, note: 'Active bookings & works', icon: CheckCircle, action: () => setActiveTab('works'), color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Manage Categories', count: categories.length, note: 'Skill professions', icon: Grid, action: () => setActiveTab('categories'), color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Open Complaints', count: complaints.filter(c => c.complaint_status === 'SUBMITTED').length, note: 'Requires investigation', icon: MessageSquareWarning, action: () => setActiveTab('complaints'), color: 'text-red-600', bg: 'bg-red-50' },
                  { label: 'Bulk Matchmaking', count: bulkRequests.filter(r => r.status === 'PENDING').length, note: 'Pending contractor teams', icon: Layers, action: () => setActiveTab('matchmaking'), color: 'text-indigo-600', bg: 'bg-indigo-50' },
                ].map((item, i) => (
                  <button key={i} onClick={item.action}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all text-left group">
                    <div className="flex items-center gap-3">
                      <div className={`${item.bg} p-2.5 rounded-lg`}>
                        <item.icon size={18} className={item.color} />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">{item.count}</div>
                        <div className="text-xs text-gray-500">{item.label} · {item.note}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 2. MANAGE WORKERS ── */}
          {activeTab === 'workers' && (
            <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Manage Workers ({workers.length})</h2>
                  <p className="text-xs text-gray-500">Monitor status, toggle account access and verify identity badges</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by worker name or mobile..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Worker</th>
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Mobile</th>
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">KYC Badge</th>
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Account</th>
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {workers.map(w => (
                      <tr key={w.user_id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {w.full_name?.charAt(0) || 'W'}
                            </div>
                            <span>{w.full_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-600 font-mono text-xs">{w.mobile_number}</td>
                        <td className="py-3 px-3">
                          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{w.account_type}</span>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={w.verification_status} />
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={w.account_status} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleUserVerify(w.user_id, w.verification_status)}
                              className={`px-2 py-1 text-xs rounded font-medium ${
                                w.verification_status === 'VERIFIED'
                                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100'
                              }`}
                              title="Toggle KYC badge"
                            >
                              {w.verification_status === 'VERIFIED' ? 'Revoke KYC' : 'Verify'}
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(w.user_id, w.account_status)}
                              className={`px-2 py-1 text-xs rounded font-medium ${
                                w.account_status === 'ACTIVE'
                                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              }`}
                            >
                              {w.account_status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── 3. MANAGE CUSTOMERS ── */}
          {activeTab === 'customers' && (
            <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Manage Customers ({customers.length})</h2>
                  <p className="text-xs text-gray-500">View registered hiring accounts and manage platform permissions</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Customer Name</th>
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Mobile</th>
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Account Status</th>
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {customers.map(c => (
                      <tr key={c.user_id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 font-medium text-gray-900">{c.full_name}</td>
                        <td className="py-3 px-3 text-gray-600 font-mono text-xs">{c.mobile_number}</td>
                        <td className="py-3 px-3"><StatusBadge status={c.account_status} /></td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(c.user_id, c.account_status)}
                            className={`px-2.5 py-1 text-xs rounded font-medium ${
                              c.account_status === 'ACTIVE'
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {c.account_status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── 4. MANAGE CONTRACTORS ── */}
          {activeTab === 'contractors' && (
            <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Manage Contractors ({contractors.length})</h2>
                  <p className="text-xs text-gray-500">Corporate & construction partner accounts managing workforce crews</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contractors..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Contractor</th>
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Mobile</th>
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {contractors.map(c => (
                      <tr key={c.user_id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 font-medium text-gray-900">{c.full_name}</td>
                        <td className="py-3 px-3 text-gray-600 font-mono text-xs">{c.mobile_number}</td>
                        <td className="py-3 px-3"><StatusBadge status={c.account_status} /></td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(c.user_id, c.account_status)}
                            className={`px-2.5 py-1 text-xs rounded font-medium ${
                              c.account_status === 'ACTIVE'
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {c.account_status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── 5. MANAGE WORKS / JOBS ── */}
          {activeTab === 'works' && (
            <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Manage Works & Bookings ({filteredBookings.length})</h2>
                  <p className="text-xs text-gray-500">Live feed of service bookings, work statuses, and agreed amounts</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by worker, customer or status..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl text-sm">
                  No works / bookings logged yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                        <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Worker</th>
                        <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                        <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredBookings.map(b => (
                        <tr key={b.booking_id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-medium text-gray-900">{b.customer_name}</div>
                            <div className="text-[11px] text-gray-400">{b.customer_mobile}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-gray-900">{b.worker_name}</div>
                            <div className="text-[11px] text-gray-400">{b.worker_mobile}</div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-gray-900">₹{b.agreed_amount || 0}</td>
                          <td className="py-3 px-3"><StatusBadge status={b.booking_status} /></td>
                          <td className="py-3 px-3 text-right">
                            <select
                              value={b.booking_status}
                              onChange={e => handleUpdateBookingStatus(b.booking_id, e.target.value)}
                              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="ACCEPTED">ACCEPTED</option>
                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── 6. WORKER KYC STATUS ── */}
          {activeTab === 'verifications' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Worker KYC Verification Queue</h2>
                  <p className="text-xs text-gray-500">{verifications.length} documents awaiting review</p>
                </div>
              </div>
              {verifications.length === 0 ? (
                <div className="py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <ShieldCheck size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">All clear — no pending verifications</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Worker</th>
                        <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Doc Type</th>
                        <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Preview</th>
                        <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {verifications.map((v) => (
                        <tr key={v.request_id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-medium text-gray-900">{v.user?.full_name}</div>
                            <div className="text-xs text-gray-400">{v.user?.mobile_number}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded">
                              {v.document_type}
                            </span>
                          </td>
                          <td className="py-3 px-3"><StatusBadge status={v.status} /></td>
                          <td className="py-3 px-3">
                            <button onClick={() => setPreviewDoc(v.storage_reference)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
                              <Eye size={13} /> View Doc
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button disabled={isProcessing} onClick={() => handleVerify(v.request_id, 'VERIFIED')}
                                className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-medium disabled:opacity-50">
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button disabled={isProcessing} onClick={() => setRejectId(v.request_id)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-medium disabled:opacity-50">
                                <XCircle size={12} /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── 7. MANAGE CATEGORIES ── */}
          {activeTab === 'categories' && (
            <div className="p-5 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Manage Service Categories & Professions</h2>
                  <p className="text-xs text-gray-500">Define available skills, professions, and workforce domains</p>
                </div>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">Add New Skill Profession</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Profession Name (e.g. Mason)"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={newCatGroup}
                    onChange={e => setNewCatGroup(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Home Maintenance">Home Maintenance</option>
                    <option value="Construction">Construction</option>
                    <option value="Woodwork">Woodwork</option>
                    <option value="Cleaning & Sanitation">Cleaning & Sanitation</option>
                    <option value="Automotive">Automotive</option>
                  </select>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    <Plus size={14} /> Add Category
                  </button>
                </div>
              </form>

              {/* Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat: any) => (
                  <div key={cat.profession_id} className="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-blue-200 transition-all flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {cat.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 truncate">{cat.name}</div>
                      <div className="text-[11px] text-gray-500">{cat.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 8. COMPLAINTS ── */}
          {activeTab === 'complaints' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Disputes & Complaints</h2>
                  <p className="text-xs text-gray-500">{complaints.length} registered dispute cases</p>
                </div>
              </div>
              {complaints.length === 0 ? (
                <div className="py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <MessageSquareWarning size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">No active disputes</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        {['Case ID', 'Category', 'Status', 'Description', 'Evidence', 'Action'].map(h => (
                          <th key={h} className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {complaints.map((c) => (
                        <tr key={c.complaint_id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3 font-mono text-xs text-gray-700">{c.case_id}</td>
                          <td className="py-3 px-3 text-gray-700">{c.complaint_category}</td>
                          <td className="py-3 px-3"><StatusBadge status={c.complaint_status} /></td>
                          <td className="py-3 px-3 text-gray-500 max-w-[200px] truncate text-xs" title={c.description}>{c.description}</td>
                          <td className="py-3 px-3">
                            {c.evidence?.length > 0 ? (
                              <button onClick={() => setPreviewDoc(c.evidence[0].file_path)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
                                <Eye size={13} /> View
                              </button>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="py-3 px-3">
                            <button onClick={() => setResolveComplaintId(c.complaint_id)}
                              className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-medium transition-colors">
                              Resolve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── 9. BULK MATCHMAKING ── */}
          {activeTab === 'matchmaking' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Bulk Workforce Matchmaking</h2>
                  <p className="text-xs text-gray-500">{bulkRequests.length} contractor workforce requisitions</p>
                </div>
              </div>
              {bulkRequests.length === 0 ? (
                <div className="py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <Layers size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">No active bulk requests</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        {['Project', 'Contractor ID', 'Requirements', 'Status', 'Actions'].map(h => (
                          <th key={h} className="py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bulkRequests.map((r) => (
                        <tr key={r.request_id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3 font-medium text-gray-900">{r.project_name}</td>
                          <td className="py-3 px-3 font-mono text-xs text-gray-500 max-w-[120px] truncate">{r.contractor_id}</td>
                          <td className="py-3 px-3 text-xs text-gray-600 space-y-0.5">
                            {r.requirements?.map((req: any) => (
                              <div key={req.requirement_id}>{req.quantity}× {req.profession}</div>
                            ))}
                          </td>
                          <td className="py-3 px-3"><StatusBadge status={r.status} /></td>
                          <td className="py-3 px-3">
                            {r.status === 'PENDING' && (
                              <button onClick={() => setAssignBulkId(r.request_id)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-medium transition-colors">
                                <UserCog size={12} /> Assign Team
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── 10. FINANCIALS ── */}
          {activeTab === 'financials' && (
            <div className="p-5 space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Financial Revenue & Invoices</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Transaction Volume',    value: `₹${(financials?.total_transactions || 0).toLocaleString('en-IN')}`,     color: 'bg-green-50 border-green-100', text: 'text-green-900', sub: 'text-green-700' },
                  { label: 'Platform Revenue (10%)', value: `₹${(financials?.total_platform_revenue || 0).toLocaleString('en-IN')}`, color: 'bg-blue-50 border-blue-100',   text: 'text-blue-900',  sub: 'text-blue-700' },
                  { label: 'Tax Withheld (5%)',      value: `₹${(financials?.total_tax_withheld || 0).toLocaleString('en-IN')}`,     color: 'bg-yellow-50 border-yellow-100',text: 'text-yellow-900',sub: 'text-yellow-700' },
                  { label: 'Total Payments Logged',  value: financials?.total_payments_count || 0,                                   color: 'bg-purple-50 border-purple-100',text: 'text-purple-900',sub: 'text-purple-700' },
                ].map((f, i) => (
                  <div key={i} className={`rounded-xl border p-5 ${f.color}`}>
                    <div className={`text-xs font-semibold mb-2 ${f.sub}`}>{f.label}</div>
                    <div className={`text-3xl font-black ${f.text}`}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 11. SUMMARY STATS ── */}
          {activeTab === 'stats' && (
            <div className="p-5">
              <SummaryStatsCard
                data={[
                  { metric: 'Total Users',         count: stats?.total_users || 0,              revenue: stats?.total_revenue || 0,              pending_kyc: stats?.pending_verifications || 0, fee_pct: 10 },
                  { metric: 'Workers',             count: stats?.total_workers || 0,            revenue: (stats?.total_revenue || 0) * 0.7,      pending_kyc: 2,                                  fee_pct: 8 },
                  { metric: 'Customers',           count: stats?.total_customers || 0,          revenue: stats?.total_revenue || 0,              pending_kyc: 0,                                  fee_pct: 10 },
                  { metric: 'Bulk Requests',       count: bulkRequests.length,                  revenue: 18000,                                  pending_kyc: 0,                                  fee_pct: 12 },
                  { metric: 'Financial Payouts',   count: financials?.total_payments_count || 0,revenue: financials?.total_transactions || 0,    pending_kyc: 1,                                  fee_pct: 5 },
                ]}
                title="Admin Platform Metrics"
                subtitle="Automated analysis across all system KPI numeric columns"
              />
            </div>
          )}

        </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Document Preview</h3>
              <button onClick={() => setPreviewDoc(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-50">
              {previewDoc.endsWith('.pdf') ? (
                <iframe src={`${API_ORIGIN}${previewDoc}`} className="w-full h-[600px] border-0 rounded-lg" />
              ) : (
                <img src={`${API_ORIGIN}${previewDoc}`} alt="Document Preview" className="max-w-full max-h-[600px] object-contain rounded-lg" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle size={18} className="text-red-500" />
              <h3 className="font-semibold text-gray-900">Reject Verification</h3>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-red-300 outline-none resize-none"
              rows={4} placeholder="e.g. Image is blurry, document expired..."
              value={reason} onChange={e => setReason(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setRejectId(null); setReason(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
              <button onClick={() => handleVerify(rejectId, 'REJECTED', reason)}
                disabled={!reason.trim() || isProcessing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                {isProcessing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Complaint Modal */}
      {resolveComplaintId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquareWarning size={18} className="text-indigo-500" />
              <h3 className="font-semibold text-gray-900">Resolve Complaint</h3>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Internal Remarks</label>
            <textarea className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-300 outline-none resize-none"
              rows={3} placeholder="Investigation findings..." id="complaint-remarks" />
            <label className="block text-sm font-medium text-gray-700 mt-3 mb-2">Set Status</label>
            <select id="complaint-status" className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900">
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setResolveComplaintId(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
              <button
                onClick={async () => {
                  const remarks = (document.getElementById('complaint-remarks') as HTMLTextAreaElement).value;
                  const status = (document.getElementById('complaint-status') as HTMLSelectElement).value;
                  setIsProcessing(true);
                  try {
                    const res = await fetchWithAuth(`/v1/complaints/admin/${resolveComplaintId}/resolve?status=${status}&admin_remarks=${encodeURIComponent(remarks)}`, { method: 'PATCH' });
                    if (res.ok) { showToast('Complaint updated', 'success'); setResolveComplaintId(null); loadAll(); }
                    else showToast('Failed to update', 'error');
                  } finally { setIsProcessing(false); }
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                {isProcessing ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading admin console...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}

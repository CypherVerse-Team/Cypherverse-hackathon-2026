'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_ORIGIN, fetchWithAuth } from '@/lib/api';
import {
  Users, Briefcase, IndianRupee, ShieldAlert,
  CheckCircle, XCircle, Eye, BarChart2, MessageSquareWarning,
  Layers, TrendingUp, ShieldCheck, Clock, AlertTriangle,
  ChevronRight, RefreshCw, UserCog, X
} from 'lucide-react';
import SummaryStatsCard from '@/components/SummaryStatsCard';

const TABS = [
  { id: 'overview',       label: 'Overview',          icon: BarChart2 },
  { id: 'verifications',  label: 'KYC Queue',         icon: ShieldCheck },
  { id: 'complaints',     label: 'Complaints',        icon: MessageSquareWarning },
  { id: 'matchmaking',    label: 'Bulk Matchmaking',  icon: Layers },
  { id: 'financials',     label: 'Financials',        icon: TrendingUp },
  { id: 'stats',          label: 'Summary Stats',     icon: BarChart2 },
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    PENDING:       'bg-amber-50 text-amber-700 border border-amber-200',
    VERIFIED:      'bg-green-50 text-green-700 border border-green-200',
    REJECTED:      'bg-red-50 text-red-700 border border-red-200',
    SUBMITTED:     'bg-red-50 text-red-700 border border-red-200',
    INVESTIGATING: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    RESOLVED:      'bg-green-50 text-green-700 border border-green-200',
    CLOSED:        'bg-gray-100 text-gray-600 border border-gray-200',
    ASSIGNED:      'bg-blue-50 text-blue-700 border border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [bulkRequests, setBulkRequests] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resolveComplaintId, setResolveComplaintId] = useState<string | null>(null);
  const [assignBulkId, setAssignBulkId] = useState<string | null>(null);
  const [teamIdInput, setTeamIdInput] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'error' | 'success' } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAll = async () => {
    setRefreshing(true);
    try {
      const [sRes, vRes, cRes, bRes, fRes] = await Promise.all([
        fetchWithAuth('/admin/stats'),
        fetchWithAuth('/v1/admin/verification/queue'),
        fetchWithAuth('/v1/complaints/admin'),
        fetchWithAuth('/v1/contractors/admin/matchmaking'),
        fetchWithAuth('/v1/admin/financial-overview'),
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (vRes.ok) setVerifications(await vRes.json());
      if (cRes.ok) setComplaints(await cRes.json());
      if (bRes.ok) setBulkRequests(await bRes.json());
      if (fRes.ok) setFinancials(await fRes.json());
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
        showToast(`Marked as ${status}`, 'success');
        setRejectId(null); setReason('');
        loadAll();
      } else {
        const err = await res.json();
        showToast(err.detail || 'Error', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setIsProcessing(false); }
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

  const kpiCards = [
    { label: 'Total Users',    value: stats.total_users,            sub: 'Registered accounts',   icon: Users,        accent: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-600' },
    { label: 'Total Workers',  value: stats.total_workers,          sub: 'Active on platform',    icon: Briefcase,    accent: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: 'Platform Revenue', value: `₹${(stats.total_revenue || 0).toLocaleString('en-IN')}`, sub: '10% commission',    icon: IndianRupee,  accent: 'bg-green-500',  light: 'bg-green-50',  text: 'text-green-600' },
    { label: 'Pending KYC',    value: stats.pending_verifications,  sub: 'Awaiting review',       icon: ShieldAlert,  accent: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
  ];

  return (
    <div className="space-y-5 relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Admin Control Panel</h1>
          <p className="text-gray-500 text-sm">Manage users, workers, KYC verification, complaints & financials</p>
        </div>
        <button
          onClick={loadAll}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
            <div className={`${card.light} p-3 rounded-lg flex-shrink-0`}>
              <card.icon size={20} className={card.text} />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold text-gray-900 leading-tight">{card.value ?? '—'}</div>
              <div className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel: Left Tabs + Right Content */}
      <div className="flex gap-5">

        {/* Left Tab Navigation */}
        <div className="w-48 flex-shrink-0 space-y-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const badgeCount =
              tab.id === 'verifications' ? verifications.length :
              tab.id === 'complaints' ? complaints.filter(c => c.complaint_status === 'SUBMITTED').length :
              tab.id === 'matchmaking' ? bulkRequests.filter(r => r.status === 'PENDING').length : 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-blue-600 flex-shrink-0' : 'text-gray-400 flex-shrink-0'} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="truncate flex-1">{tab.label}</span>
                {badgeCount > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${isActive ? 'bg-blue-600 text-white' : 'bg-red-100 text-red-700'}`}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl overflow-hidden">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="p-5 space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Platform Snapshot</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'KYC Queue', count: verifications.length, note: 'Pending verifications', icon: ShieldAlert, action: () => setActiveTab('verifications'), color: 'text-orange-600', bg: 'bg-orange-50' },
                  { label: 'Open Complaints', count: complaints.filter(c => c.complaint_status === 'SUBMITTED').length, note: 'Requires action', icon: MessageSquareWarning, action: () => setActiveTab('complaints'), color: 'text-red-600', bg: 'bg-red-50' },
                  { label: 'Bulk Requests', count: bulkRequests.filter(r => r.status === 'PENDING').length, note: 'Pending assignment', icon: Layers, action: () => setActiveTab('matchmaking'), color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Total Payouts', count: financials?.total_payments_count || 0, note: 'Platform transactions', icon: TrendingUp, action: () => setActiveTab('financials'), color: 'text-green-600', bg: 'bg-green-50' },
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
              {/* Quick activity summary */}
              <div className="border-t border-gray-100 pt-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Stats</div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Transaction Volume', value: `₹${(financials?.total_transactions || 0).toLocaleString('en-IN')}` },
                    { label: 'Platform Revenue', value: `₹${(financials?.total_platform_revenue || 0).toLocaleString('en-IN')}` },
                    { label: 'Tax Withheld', value: `₹${(financials?.total_tax_withheld || 0).toLocaleString('en-IN')}` },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-base font-bold text-gray-900">{s.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── KYC VERIFICATIONS ── */}
          {activeTab === 'verifications' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">KYC Verification Queue</h2>
                <span className="text-xs text-gray-500">{verifications.length} pending</span>
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
                      <tr className="border-b border-gray-100">
                        <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Worker</th>
                        <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Document</th>
                        <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</th>
                        <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {verifications.map((v) => (
                        <tr key={v.request_id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {v.user?.full_name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">{v.user?.full_name}</div>
                                <div className="text-xs text-gray-400">{v.user?.mobile_number}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded">
                              {v.document_type}
                            </span>
                          </td>
                          <td className="py-3 pr-4"><StatusBadge status={v.status} /></td>
                          <td className="py-3 pr-4">
                            <button onClick={() => setPreviewDoc(v.storage_reference)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors">
                              <Eye size={13} /> View Doc
                            </button>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button disabled={isProcessing} onClick={() => handleVerify(v.request_id, 'VERIFIED')}
                                className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button disabled={isProcessing} onClick={() => setRejectId(v.request_id)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
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

          {/* ── COMPLAINTS ── */}
          {activeTab === 'complaints' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Disputes & Complaints</h2>
                <span className="text-xs text-gray-500">{complaints.length} total</span>
              </div>
              {complaints.length === 0 ? (
                <div className="py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <MessageSquareWarning size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">No active complaints</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['Case ID', 'Category', 'Status', 'Description', 'Evidence', 'Actions'].map(h => (
                          <th key={h} className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {complaints.map((c) => (
                        <tr key={c.complaint_id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4 font-mono text-xs text-gray-700">{c.case_id}</td>
                          <td className="py-3 pr-4 text-gray-700">{c.complaint_category}</td>
                          <td className="py-3 pr-4"><StatusBadge status={c.complaint_status} /></td>
                          <td className="py-3 pr-4 text-gray-500 max-w-[200px] truncate text-xs" title={c.description}>{c.description}</td>
                          <td className="py-3 pr-4">
                            {c.evidence?.length > 0 ? (
                              <button onClick={() => setPreviewDoc(c.evidence[0].file_path)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
                                <Eye size={13} /> View
                              </button>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="py-3">
                            <button onClick={() => setResolveComplaintId(c.complaint_id)}
                              className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors">
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

          {/* ── BULK MATCHMAKING ── */}
          {activeTab === 'matchmaking' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Bulk Workforce Matchmaking</h2>
                <span className="text-xs text-gray-500">{bulkRequests.length} total requests</span>
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
                      <tr className="border-b border-gray-100">
                        {['Project', 'Contractor ID', 'Requirements', 'Status', 'Actions'].map(h => (
                          <th key={h} className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bulkRequests.map((r) => (
                        <tr key={r.request_id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4 font-medium text-gray-900">{r.project_name}</td>
                          <td className="py-3 pr-4 font-mono text-xs text-gray-500 max-w-[120px] truncate">{r.contractor_id}</td>
                          <td className="py-3 pr-4 text-xs text-gray-600 space-y-0.5">
                            {r.requirements?.map((req: any) => (
                              <div key={req.requirement_id}>{req.quantity}× {req.profession}</div>
                            ))}
                          </td>
                          <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                          <td className="py-3">
                            {r.status === 'PENDING' && (
                              <button onClick={() => setAssignBulkId(r.request_id)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors">
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

          {/* ── FINANCIALS ── */}
          {activeTab === 'financials' && (
            <div className="p-5 space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Financial Overview</h2>
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

          {/* ── SUMMARY STATS ── */}
          {activeTab === 'stats' && (
            <div className="p-5">
              <SummaryStatsCard
                data={[
                  { metric: 'Total Users',         count: stats?.total_users || 0,              revenue: stats?.total_revenue || 0,              pending_kyc: stats?.pending_verifications || 0, fee_pct: 10 },
                  { metric: 'Workers',             count: stats?.total_workers || 0,            revenue: (stats?.total_revenue || 0) * 0.7,      pending_kyc: 2,                                  fee_pct: 8 },
                  { metric: 'Bulk Requests',       count: bulkRequests.length,                  revenue: 18000,                                  pending_kyc: 0,                                  fee_pct: 12 },
                  { metric: 'Complaints Logged',   count: complaints.length,                    revenue: 0,                                      pending_kyc: 0,                                  fee_pct: 0 },
                  { metric: 'Financial Payouts',   count: financials?.total_payments_count || 0,revenue: financials?.total_transactions || 0,    pending_kyc: 1,                                  fee_pct: 5 },
                ]}
                title="Admin Platform Metrics"
                subtitle="Automated analysis across all system KPI numeric columns"
              />
            </div>
          )}

        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Document Preview */}
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
              rows={4} placeholder="e.g. Image is blurry, name does not match..."
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

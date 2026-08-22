'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_ORIGIN, fetchWithAuth } from '@/lib/api';
import { Users, Briefcase, IndianRupee, ShieldAlert, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  
  // Modals state
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'error' | 'success'} | null>(null);

  const [activeTab, setActiveTab] = useState('verifications');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [bulkRequests, setBulkRequests] = useState<any[]>([]);
  const [resolveComplaintId, setResolveComplaintId] = useState<string | null>(null);
  const [assignBulkId, setAssignBulkId] = useState<string | null>(null);
  const [teamIdInput, setTeamIdInput] = useState('');

  const loadStats = async () => {
    try {
      const res = await fetchWithAuth('/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch (e) {}
  };

  const loadVerifications = async () => {
    try {
      const res = await fetchWithAuth('/v1/admin/verification/queue');
      if (res.ok) setVerifications(await res.json());
    } catch (e) {}
  };

  const loadComplaints = async () => {
    try {
      const res = await fetchWithAuth('/v1/complaints/admin');
      if (res.ok) setComplaints(await res.json());
    } catch (e) {}
  };

  const loadBulkRequests = async () => {
    try {
      const res = await fetchWithAuth('/v1/contractors/admin/matchmaking');
      if (res.ok) setBulkRequests(await res.json());
    } catch (e) {}
  };

  const [financials, setFinancials] = useState<any>(null);
  const loadFinancials = async () => {
    try {
      const res = await fetchWithAuth('/v1/admin/financial-overview');
      if (res.ok) setFinancials(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.account_type !== 'ADMIN')) {
      router.push('/');
    } else if (isAuthenticated) {
      loadStats();
      loadVerifications();
      loadComplaints();
      loadBulkRequests();
      loadFinancials();
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleVerify = async (requestId: string, status: string, reasonStr: string = '') => {
    setIsProcessing(true);
    try {
      let url = `/v1/admin/verification/${requestId}/review?status=${status}`;
      if (reasonStr) {
        url += `&reason=${encodeURIComponent(reasonStr)}`;
      }
      const res = await fetchWithAuth(url, { method: 'PATCH' });
      if (res.ok) {
        setToast({ msg: `Successfully marked as ${status}`, type: 'success' });
        setRejectId(null);
        setReason('');
        loadVerifications();
        loadStats();
      } else {
        const err = await res.json();
        setToast({ msg: err.detail || 'Error updating status', type: 'error' });
      }
    } catch (e) {
      setToast({ msg: 'Network error', type: 'error' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Workers', value: stats.total_workers, icon: Briefcase, color: 'bg-indigo-500' },
    { label: 'Total Revenue', value: `₹${stats.total_revenue}`, icon: IndianRupee, color: 'bg-green-500' },
    { label: 'Pending KYC', value: stats.pending_verifications, icon: ShieldAlert, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8 relative">
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white font-medium z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Platform overview and KPI monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
            <div className={`${stat.color} text-white p-4 rounded-xl mr-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-4 mb-4">
        <button 
          onClick={() => setActiveTab('verifications')} 
          className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'verifications' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
        >
          KYC Verifications
        </button>
        <button 
          onClick={() => setActiveTab('complaints')} 
          className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'complaints' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
        >
          Disputes / Complaints
        </button>
        <button 
          onClick={() => setActiveTab('matchmaking')} 
          className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'matchmaking' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
        >
          Bulk Matchmaking
        </button>
        <button 
          onClick={() => setActiveTab('financials')} 
          className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'financials' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
        >
          Financial Overview
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'verifications' && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Verification Queue</h2>
            {verifications.length === 0 ? (
              <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                No pending verifications.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 text-sm font-semibold text-gray-600">Worker</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Document Type</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Document</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((v) => (
                      <tr key={v.request_id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium text-gray-900">{v.user?.full_name}</div>
                          <div className="text-xs text-gray-500">{v.user?.mobile_number}</div>
                        </td>
                        <td className="p-3">
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                            {v.document_type}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${v.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button 
                            onClick={() => setPreviewDoc(v.storage_reference)}
                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4 mr-1" /> View Doc
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2 items-center">
                            <button 
                              disabled={isProcessing}
                              onClick={() => handleVerify(v.request_id, 'VERIFIED')} 
                              className="flex items-center px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Approve
                            </button>
                            <button 
                              disabled={isProcessing}
                              onClick={() => setRejectId(v.request_id)} 
                              className="flex items-center px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'complaints' && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Complaints & Disputes</h2>
            {complaints.length === 0 ? (
              <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                No active complaints.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 text-sm font-semibold text-gray-600">Case ID</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Category</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Description</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Evidence</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c.complaint_id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-900">{c.case_id}</td>
                        <td className="p-3 text-sm">{c.complaint_category}</td>
                        <td className="p-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            c.complaint_status === 'SUBMITTED' ? 'bg-red-100 text-red-800' :
                            c.complaint_status === 'INVESTIGATING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {c.complaint_status}
                          </span>
                        </td>
                        <td className="p-3 text-sm max-w-xs truncate" title={c.description}>
                          {c.description}
                        </td>
                        <td className="p-3">
                          {c.evidence && c.evidence.length > 0 ? (
                            <button 
                              onClick={() => setPreviewDoc(c.evidence[0].file_path)}
                              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <Eye className="w-4 h-4 mr-1" /> View File
                            </button>
                          ) : <span className="text-gray-400 text-sm">None</span>}
                        </td>
                        <td className="p-3">
                          <button 
                            onClick={() => setResolveComplaintId(c.complaint_id)}
                            className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg text-sm font-medium"
                          >
                            Resolve / Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'matchmaking' && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bulk Workforce Matchmaking</h2>
            {bulkRequests.length === 0 ? (
              <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                No active bulk requests.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 text-sm font-semibold text-gray-600">Project</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Contractor ID</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Requirements</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkRequests.map((r) => (
                      <tr key={r.request_id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-900">{r.project_name}</td>
                        <td className="p-3 text-sm text-gray-500">{r.contractor_id}</td>
                        <td className="p-3 text-sm">
                          {r.requirements.map((req: any) => (
                            <div key={req.requirement_id}>{req.quantity}x {req.profession}</div>
                          ))}
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {r.status === 'PENDING' && (
                            <button 
                              onClick={() => setAssignBulkId(r.request_id)}
                              className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg text-sm font-medium"
                            >
                              Assign Team
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'financials' && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Overview & Revenue Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <div className="text-sm font-medium text-green-800 mb-1">Total Transaction Volume</div>
                <div className="text-3xl font-black text-green-900">₹{financials?.total_transactions?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="text-sm font-medium text-blue-800 mb-1">Platform Revenue (10%)</div>
                <div className="text-3xl font-black text-blue-900">₹{financials?.total_platform_revenue?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                <div className="text-sm font-medium text-yellow-800 mb-1">Tax Withheld (5%)</div>
                <div className="text-3xl font-black text-yellow-900">₹{financials?.total_tax_withheld?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <div className="text-sm font-medium text-purple-800 mb-1">Total Payments Logged</div>
                <div className="text-3xl font-black text-purple-900">{financials?.total_payments_count || 0}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-lg text-gray-900">Document Preview</h3>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-500 hover:bg-gray-200 p-2 rounded-lg">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto flex justify-center bg-gray-100">
              {previewDoc.endsWith('.pdf') ? (
                <iframe src={`${API_ORIGIN}${previewDoc}`} className="w-full h-[600px] border-0" />
              ) : (
                <img src={`${API_ORIGIN}${previewDoc}`} alt="Document Preview" className="max-w-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Reject Verification</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection</label>
              <textarea 
                className="w-full border rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" 
                rows={4}
                placeholder="e.g. Image is blurry, name does not match..."
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => { setRejectId(null); setReason(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleVerify(rejectId, 'REJECTED', reason)}
                disabled={!reason.trim() || isProcessing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {resolveComplaintId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Resolve Complaint</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Internal Remarks</label>
              <textarea 
                className="w-full border rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" 
                rows={4}
                placeholder="Investigation findings..."
                id="complaint-remarks"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Set Status</label>
              <select id="complaint-status" className="w-full border rounded-lg p-3 text-gray-900">
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setResolveComplaintId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  const remarks = (document.getElementById('complaint-remarks') as HTMLTextAreaElement).value;
                  const status = (document.getElementById('complaint-status') as HTMLSelectElement).value;
                  setIsProcessing(true);
                  try {
                    const res = await fetchWithAuth(`/v1/complaints/admin/${resolveComplaintId}/resolve?status=${status}&admin_remarks=${encodeURIComponent(remarks)}`, { method: 'PATCH' });
                    if (res.ok) {
                      setToast({ msg: 'Complaint updated', type: 'success' });
                      setResolveComplaintId(null);
                      loadComplaints();
                    } else {
                      setToast({ msg: 'Failed to update complaint', type: 'error' });
                    }
                  } finally {
                    setIsProcessing(false);
                    setTimeout(() => setToast(null), 3000);
                  }
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {isProcessing ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

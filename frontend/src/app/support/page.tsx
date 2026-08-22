'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth, API_ORIGIN } from '@/lib/api';
import { 
  HelpCircle, AlertTriangle, CheckCircle, FileText, Upload, 
  Clock, MessageSquare, ShieldAlert, Phone, Mail, Send, 
  CheckCircle2, Eye, ShieldCheck, ChevronRight, Sparkles, X
} from 'lucide-react';
import Link from 'next/link';

const SUPPORT_CATEGORIES = [
  'General Inquiry & Help',
  'Quality of Work / Service Issue',
  'Payment & Payout Dispute',
  'Worker No-Show / Delay',
  'KYC & Verification Help',
  'Safety & Misconduct Report',
  'App Bug / Technical Issue',
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    SUBMITTED:     'bg-red-50 text-red-700 border border-red-200',
    INVESTIGATING: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    RESOLVED:      'bg-green-50 text-green-700 border border-green-200',
    CLOSED:        'bg-gray-100 text-gray-600 border border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

export default function SupportPage() {
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'create' | 'my_tickets'>('create');
  const [bookings, setBookings] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  
  // Form state
  const [category, setCategory] = useState(SUPPORT_CATEGORIES[0]);
  const [bookingId, setBookingId] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, tRes] = await Promise.all([
        fetchWithAuth('/v1/bookings/me'),
        fetchWithAuth('/v1/complaints/me'),
      ]);
      if (bRes.ok) {
        const bData = await bRes.json();
        setBookings(bData);
      }
      if (tRes.ok) {
        setMyTickets(await tRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setMsg({ type: 'error', text: 'Please enter a description for your support request' });
      return;
    }
    setMsg(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.append('complaint_category', category);
    formData.append('description', description.trim());
    if (bookingId && bookingId !== 'none') {
      formData.append('booking_id', bookingId);
    }
    if (file) {
      formData.append('file', file);
    }

    try {
      const res = await fetchWithAuth('/v1/complaints/', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const created = await res.json();
        setMsg({ 
          type: 'success', 
          text: `Support ticket #${created.case_id} submitted! Our team will respond shortly.` 
        });
        setDescription('');
        setBookingId('');
        setFile(null);
        loadData();
        setActiveTab('my_tickets');
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.detail || 'Failed to submit support ticket' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Help & Support Center</h1>
          <p className="text-sm text-gray-500">Raise support tickets, report job disputes, and track resolutions</p>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'create' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Raise Ticket
            </button>
            <button
              onClick={() => setActiveTab('my_tickets')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'my_tickets' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Tickets ({myTickets.length})
            </button>
          </div>
        )}
      </div>

      {/* Quick Help Contacts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Phone size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Toll-Free Helpline</div>
            <div className="text-sm font-bold text-gray-900">+91 1800-123-7890</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Mail size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Email Support</div>
            <div className="text-sm font-bold text-gray-900">support@shramsetu.in</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Resolution SLA</div>
            <div className="text-sm font-bold text-gray-900">&lt; 24 Hours Response</div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {msg && (
        <div className={`p-4 rounded-xl flex items-center space-x-2 text-sm font-medium ${
          msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Main Support Workspace */}
      {!isAuthenticated ? (
        <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Sign in to Submit Support Tickets</h2>
          <p className="text-xs text-gray-500 mb-6">Log in to your ShramSetu account to raise disputes, track resolution progress and receive official support.</p>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs inline-block transition-all shadow-sm">
            Log In to Account
          </Link>
        </div>
      ) : (
        <>
          {/* TAB 1: CREATE TICKET */}
          {activeTab === 'create' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="mb-5 pb-4 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Submit a Support Ticket / Dispute</h2>
                <p className="text-xs text-gray-500 mt-0.5">Please provide details regarding your inquiry, booking issue, or service grievance.</p>
              </div>

              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Issue Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    >
                      {SUPPORT_CATEGORIES.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Optional Booking Association */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Related Booking (Optional)
                    </label>
                    <select
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    >
                      <option value="">None / General Inquiry</option>
                      {bookings.map((b) => (
                        <option key={b.booking_id} value={b.booking_id}>
                          Booking #{b.booking_id.substring(0, 8)} — ₹{b.agreed_amount || 0} ({b.booking_status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Describe Your Issue in Detail
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide detailed context, timestamps, or reasons for your request..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                {/* File Attachment */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Attach Screenshot / Document (Optional)
                  </label>
                  <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50/50 transition-colors">
                    <input
                      type="file"
                      id="support-file"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    />
                    <label htmlFor="support-file" className="cursor-pointer flex flex-col items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs font-semibold text-blue-600">
                        {file ? file.name : 'Click to upload proof (JPG, PNG, PDF)'}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">Maximum size: 5MB</span>
                    </label>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    <Send size={14} />
                    {submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MY TICKETS */}
          {activeTab === 'my_tickets' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-bold text-gray-900">My Support Tickets ({myTickets.length})</h2>
                  <p className="text-xs text-gray-500">Track current review status and admin resolution remarks</p>
                </div>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all"
                >
                  + New Ticket
                </button>
              </div>

              {myTickets.length === 0 ? (
                <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl text-xs">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-medium text-gray-600">You haven't submitted any support tickets yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {myTickets.map((t) => (
                    <div key={t.complaint_id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-gray-900">{t.case_id}</span>
                          <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded">
                            {t.complaint_category}
                          </span>
                        </div>
                        <StatusBadge status={t.complaint_status} />
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed">{t.description}</p>

                      {t.evidence && t.evidence.length > 0 && (
                        <div className="pt-1">
                          <button
                            onClick={() => setPreviewDoc(t.evidence[0].file_path)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                          >
                            <Eye size={12} /> View Attached Evidence
                          </button>
                        </div>
                      )}

                      {/* Admin Resolution Remarks */}
                      {t.admin_remarks && (
                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs text-blue-900 mt-2">
                          <div className="font-bold text-blue-950 mb-0.5">Admin Response:</div>
                          <div>{t.admin_remarks}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Attachment Preview</h3>
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

    </div>
  );
}

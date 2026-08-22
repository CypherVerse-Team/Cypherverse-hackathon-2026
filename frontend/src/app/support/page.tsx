'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api';
import { HelpCircle, AlertTriangle, CheckCircle, FileText, Upload, Clock, MessageSquare, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import AccountQuickHub from '@/components/AccountQuickHub';

export default function SupportPage() {
  const { user, isAuthenticated } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  
  // Form state
  const [bookingId, setBookingId] = useState('');
  const [category, setCategory] = useState('Quality of Work');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      const bRes = await fetchWithAuth('/v1/bookings/my-bookings');
      if (bRes.ok) {
        const data = await bRes.json();
        setBookings(data);
        if (data.length > 0) setBookingId(data[0].booking_id);
      }

      if (user?.account_type === 'ADMIN') {
        const cRes = await fetchWithAuth('/v1/complaints/admin');
        if (cRes.ok) setComplaints(await cRes.json());
      }
    } catch (e) {
      console.error(e);
    } flex: true;
    setLoading(false);
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) {
      setMsg({ type: 'error', text: 'Please select a valid booking' });
      return;
    }
    setMsg(null);

    const formData = new FormData();
    formData.append('booking_id', bookingId);
    formData.append('complaint_category', category);
    formData.append('description', description);
    if (file) {
      formData.append('file', file);
    }

    try {
      const res = await fetchWithAuth('/v1/complaints/', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setMsg({ type: 'success', text: 'Support ticket & complaint submitted successfully!' });
        setDescription('');
        setFile(null);
        loadData();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.detail || 'Failed to submit complaint' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'An error occurred' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Help & Dispute Support Center</h2>
        <p className="text-gray-600 mb-6">Please log in to raise support tickets, file disputes on service bookings, or track ticket resolutions.</p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm inline-block">
          Log In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-3">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" /> 24/7 Platform Protection & Mediation
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Support & Dispute Center</h1>
            <p className="text-blue-200 text-sm mt-1">
              Have an issue with a booking, payment, or worker performance? Submit evidence for rapid admin resolution.
            </p>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {msg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Main Form & Tickets Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Ticket Submission Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Raise New Dispute / Ticket</h2>
              <p className="text-xs text-gray-500">File a complaint for escrow hold & review</p>
            </div>
          </div>

          <form onSubmit={handleSubmitComplaint} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Booking</label>
              <select 
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                {bookings.length === 0 ? (
                  <option value="">No active or completed bookings available</option>
                ) : (
                  bookings.map((b: any) => (
                    <option key={b.booking_id} value={b.booking_id}>
                      Booking #{b.booking_id.substring(0, 8)} - ₹{b.agreed_amount || 0} ({b.booking_status})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Issue Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Quality of Work">Substandard / Incomplete Work</option>
                <option value="No Show / Delay">Worker No Show / Unreasonable Delay</option>
                <option value="Payment Dispute">Payment / Overcharging Issue</option>
                <option value="Misconduct">Professional Misconduct / Unsafe Behavior</option>
                <option value="Other">Other Query</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Detailed Explanation</label>
              <textarea 
                rows={4}
                placeholder="Describe what happened with clear details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Attach Evidence Image / Doc (Optional)</label>
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm"
            >
              Submit Ticket to Admin Review
            </button>
          </form>
        </div>

        {/* FAQs & Protection Guarantee */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-4">
            <h3 className="text-xl font-bold flex items-center text-blue-400">
              <ShieldAlert className="w-5 h-5 mr-2" /> ShramSetu Escrow Guarantee
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              When a dispute is raised, payment holds in escrow are automatically paused until an impartial admin reviews evidence from both parties.
            </p>
            <div className="space-y-3 pt-2 text-xs text-slate-400">
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Standard Resolution Time: 24 - 48 Hours</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Full refund eligible if service was unfulfilled or cancelled by worker</span>
              </div>
            </div>
          </div>

          {user?.account_type === 'ADMIN' && complaints.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">All System Complaints (Admin View)</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {complaints.map((c: any) => (
                  <div key={c.complaint_id} className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 border">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Case {c.case_id}</span>
                      <span className="text-blue-600">{c.complaint_status}</span>
                    </div>
                    <p className="text-gray-600">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <AccountQuickHub />
        </div>

      </div>
    </div>
  );
}

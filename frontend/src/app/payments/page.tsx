'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api';
import { CreditCard, DollarSign, Receipt, TrendingUp, ShieldCheck, Download, ArrowUpRight, CheckCircle2, Lock, Building, FileText } from 'lucide-react';
import Link from 'next/link';
import AccountQuickHub from '@/components/AccountQuickHub';
import InvoiceModal from '@/components/InvoiceModal';

export default function PaymentsPage() {
  const { user, isAuthenticated } = useAuth();
  
  const [earnings, setEarnings] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedInvoiceBookingId, setSelectedInvoiceBookingId] = useState<string | null>(null);
  
  // Payout account state
  const [accountType, setAccountType] = useState('UPI');
  const [accountDetails, setAccountDetails] = useState('');
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      if (user?.account_type === 'WORKER' || user?.account_type === 'GROUP_LEADER') {
        const res = await fetchWithAuth('/v1/worker/earnings');
        if (res.ok) setEarnings(await res.json());
      }

      const bRes = await fetchWithAuth('/v1/bookings/me');
      if (bRes.ok) setBookings(await bRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayoutAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutMsg(null);
    try {
      const res = await fetchWithAuth('/v1/worker/payout-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_type: accountType,
          account_details: accountDetails
        })
      });
      if (res.ok) {
        setPayoutMsg('Payout account updated successfully!');
        setAccountDetails('');
      } else {
        const err = await res.json();
        setPayoutMsg(err.detail || 'Failed to update payout account');
      }
    } catch (e: any) {
      setPayoutMsg(e.message || 'Error saving payout account');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <CreditCard className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payments & Escrow Financial Portal</h2>
        <p className="text-gray-600 mb-6">Please log in to view transaction history, download invoices, and manage bank/UPI payout accounts.</p>
        <Link href="/login" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-sm inline-block">
          Log In Now
        </Link>
      </div>
    );
  }

  const isWorker = user?.account_type === 'WORKER' || user?.account_type === 'GROUP_LEADER';

  return (
    <div className="space-y-5">
      <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Payments & Financial Invoices</h1>
          <p className="text-gray-500 text-sm">Transparent invoices, commissions, and payout settlements</p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
          <Lock className="w-3 h-3 mr-1" /> Escrow Protected
        </span>
      </div>

          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isWorker ? (
              <>
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <DollarSign className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Total Net Earnings</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">₹{earnings?.total_earnings || 0}</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">This Month Earnings</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">₹{earnings?.monthly_earnings || 0}</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Receipt className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Completed Jobs</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      {earnings?.completed_jobs_count || 0} Jobs
                    </h3>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Receipt className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Total Bookings Paid</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">₹{bookings.reduce((sum, b) => sum + (b.agreed_amount || 0), 0)}</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Completed Payments</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      {bookings.filter(b => b.booking_status === 'COMPLETED').length} Completed
                    </h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Active Escrow Protection</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">100% Guaranteed</h3>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Invoices & Payment Records */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Invoices & Payment Records</h2>
                <p className="text-xs text-slate-500 font-medium">View & download formal tax invoices for completed bookings</p>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                No booking payment records found.
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <div key={booking.booking_id} className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-sm">
                          Booking #{booking.booking_id.substring(0, 8)}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${booking.booking_status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                          {booking.booking_status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Service Date: {new Date(booking.service_start_time).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Agreed Amount</span>
                        <span className="text-base font-extrabold text-gray-900">₹{booking.agreed_amount || 0}</span>
                      </div>
                      {booking.booking_status === 'COMPLETED' && (
                        <button 
                          onClick={() => setSelectedInvoiceBookingId(booking.booking_id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center transition-colors shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1.5" /> View Invoice
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Worker Payout Account Setup */}
          {isWorker && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Payout Account</h2>
                  <p className="text-xs text-gray-500">Configure UPI ID or Bank Account for automatic payout</p>
                </div>
              </div>

              {payoutMsg && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                  {payoutMsg}
                </div>
              )}

              <form onSubmit={handleSavePayoutAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Account Method</label>
                  <select 
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="UPI">UPI ID (Google Pay, PhonePe, Paytm)</option>
                    <option value="BANK_ACCOUNT">Bank Account Transfer (NEFT/IMPS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Account Details</label>
                  <input 
                    type="text" 
                    placeholder={accountType === 'UPI' ? 'username@upi' : 'A/C Number, IFSC Code, Bank Name'}
                    value={accountDetails}
                    onChange={(e) => setAccountDetails(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm">
                  Save Payout Account
                </button>
              </form>
            </div>
          )}

      {/* Invoice Modal Component */}
      {selectedInvoiceBookingId && (
        <InvoiceModal 
          bookingId={selectedInvoiceBookingId} 
          onClose={() => setSelectedInvoiceBookingId(null)} 
        />
      )}
    </div>
  );
}

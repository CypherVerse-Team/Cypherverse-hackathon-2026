'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { Calendar, MapPin, IndianRupee, Clock, CheckCircle, XCircle, Phone, AlertTriangle, Star } from 'lucide-react';
import Link from 'next/link';
import ReviewModal from '@/components/ReviewModal';
import ComplaintModal from '@/components/ComplaintModal';
import BulkRequestModal from '@/components/BulkRequestModal';
import InvoiceModal from '@/components/InvoiceModal';
import AccountQuickHub from '@/components/AccountQuickHub';

export default function CustomerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [complaintBookingId, setComplaintBookingId] = useState<string | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [invoiceBookingId, setInvoiceBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    } else if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated, isLoading, router]);

  const loadBookings = async () => {
    try {
      const res = await fetchWithAuth('/v1/bookings/me');
      if (res.ok) {
        setBookings(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetchWithAuth(`/v1/bookings/${id}/status?status=${status}`, { method: 'PATCH' });
      if (res.ok) {
        loadBookings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecordPayment = async (bookingId: string) => {
    const mode = prompt('Enter payment mode (CASH, UPI, BANK_TRANSFER):', 'CASH');
    if (!mode || !['CASH', 'UPI', 'BANK_TRANSFER'].includes(mode.toUpperCase())) {
      alert('Invalid payment mode.');
      return;
    }
    try {
      const res = await fetchWithAuth(`/v1/bookings/${bookingId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode.toUpperCase() })
      });
      if (res.ok) {
        alert('Payment recorded successfully!');
        loadBookings();
      } else {
        const err = await res.json();
        alert(err.detail || 'Payment recording failed');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'WAITING': return 'bg-orange-100 text-orange-800';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'REJECTED': 
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStepper = (status: string) => {
    const steps = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
    if (['REJECTED', 'CANCELLED'].includes(status)) {
       return <div className="text-red-500 font-medium text-sm mt-4">Booking was {status.toLowerCase()}</div>;
    }
    
    let activeIndex = steps.indexOf(status);
    if (status === 'WAITING') activeIndex = 0;

    return (
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
    );
  };

  if (isLoading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">Track active bookings and past requests</p>
        </div>
        {user?.account_type === 'CONTRACTOR' && (
          <button 
            onClick={() => setShowBulkModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            Create Bulk Workforce Request
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Account Quick Hub */}
        <div>
          <AccountQuickHub />
        </div>

        {/* Right Column: Main Bookings */}
        <div className="lg:col-span-2 space-y-6">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">You haven't requested any services yet.</p>
              <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg">
                Find Workers
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map(b => (
            <div key={b.booking_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">Worker: {b.worker?.name || "Unknown"}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(b.booking_status)}`}>
                      {b.booking_status}
                    </span>
                    {b.price_locked && (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 border font-medium">Price Locked</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(b.scheduled_date).toLocaleString()}
                    </div>
                    {b.duration_type && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {b.duration_type}
                      </div>
                    )}
                    <div className="flex items-center">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      {b.agreed_amount}
                    </div>
                  </div>

                  {b.estimated_start_time && b.booking_status === 'WAITING' && (
                    <div className="mt-3 p-3 bg-orange-50 rounded-lg text-sm text-orange-800 font-medium border border-orange-100">
                      Worker is currently busy. Estimated Start Time: {new Date(b.estimated_start_time).toLocaleString()}
                    </div>
                  )}

                  {/* Masked or Real Phone Number */}
                  <div className="mt-4 flex items-center space-x-2">
                    {b.worker?.mobile_number?.includes('XXX') ? (
                      <div className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm flex items-center">
                        <Phone className="w-4 h-4 mr-2" /> Phone number hidden until accepted
                      </div>
                    ) : (
                      <a href={`tel:${b.worker?.mobile_number}`} className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-bold flex items-center transition-colors">
                        <Phone className="w-4 h-4 mr-2" /> Call {b.worker?.mobile_number}
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 w-full md:w-auto">
                  <Link href={`/worker/${b.worker_id}`} className="text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg text-sm">
                    View Profile
                  </Link>
                  {b.booking_status === 'IN_PROGRESS' && (
                    <button 
                      onClick={() => {
                        if(confirm('Has the worker completed the job? You will be prompted to leave a review next.')) {
                          updateStatus(b.booking_id, 'COMPLETED');
                          setReviewBookingId(b.booking_id);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                    >
                      Mark Completed
                    </button>
                  )}
                  {b.booking_status === 'COMPLETED' && (
                    <>
                      <button 
                        onClick={() => handleRecordPayment(b.booking_id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm mt-2"
                      >
                        Record Payment
                      </button>
                      <button 
                        onClick={() => setInvoiceBookingId(b.booking_id)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg text-sm mt-2"
                      >
                        View Invoice
                      </button>
                      <button 
                        onClick={() => setReviewBookingId(b.booking_id)}
                        className="flex items-center justify-center bg-yellow-50 text-yellow-700 hover:bg-yellow-100 font-medium py-2 px-4 rounded-lg text-sm transition-colors border border-yellow-200 mt-2"
                      >
                        <Star className="w-4 h-4 mr-1" /> Leave Review
                      </button>
                    </>
                  )}
                  {['PENDING', 'WAITING'].includes(b.booking_status) && (
                    <button 
                      onClick={() => {
                        if(confirm('Are you sure you want to cancel this request?')) {
                          updateStatus(b.booking_id, 'CANCELLED');
                        }
                      }}
                      className="text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-lg text-sm"
                    >
                      Cancel Request
                    </button>
                  )}
                  {['IN_PROGRESS', 'COMPLETED', 'ACCEPTED'].includes(b.booking_status) && (
                    <button 
                      onClick={() => setComplaintBookingId(b.booking_id)}
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-lg text-sm transition-colors mt-2"
                    >
                      Raise Dispute
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-2">
                {renderStepper(b.booking_status)}
              </div>
            </div>
          ))}
            </div>
          )}
        </div>

        {/* Side Column: Account Quick Hub */}
        <div className="space-y-6">
          <AccountQuickHub />
        </div>
      </div>

      {/* Modals */}
      {reviewBookingId && (
        <ReviewModal 
          bookingId={reviewBookingId} 
          onClose={() => setReviewBookingId(null)}
          onReviewSubmitted={() => {
            setReviewBookingId(null);
            loadBookings();
            alert('Review submitted successfully!');
          }}
        />
      )}
      {complaintBookingId && (
        <ComplaintModal 
          bookingId={complaintBookingId}
          onClose={() => setComplaintBookingId(null)}
          onComplaintSubmitted={() => {
            setComplaintBookingId(null);
            alert('Complaint submitted successfully. An Admin will review it shortly.');
          }}
        />
      )}
      {showBulkModal && (
        <BulkRequestModal 
          onClose={() => setShowBulkModal(false)}
          onRequestSubmitted={() => {
            setShowBulkModal(false);
            alert('Bulk Request submitted successfully!');
          }}
        />
      )}
      {invoiceBookingId && (
        <InvoiceModal
          bookingId={invoiceBookingId}
          onClose={() => setInvoiceBookingId(null)}
        />
      )}
    </div>
  );
}

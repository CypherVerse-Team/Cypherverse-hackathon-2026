'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api';
import { 
  Calendar, Clock, MapPin, IndianRupee, ShieldCheck, 
  Lock, CheckCircle2, AlertTriangle, X, Send, Sparkles 
} from 'lucide-react';
import Link from 'next/link';

export interface BookingWorkerInfo {
  id: string;
  name: string;
  profession: string;
  hourly_rate: number;
  home_city?: string;
  rating?: number;
  verified?: boolean;
  photo?: string;
}

interface BookingModalProps {
  worker: BookingWorkerInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (booking: any) => void;
}

export default function BookingModal({ worker, isOpen, onClose, onSuccess }: BookingModalProps) {
  const { user, isAuthenticated } = useAuth();

  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [durationHours, setDurationHours] = useState<number>(2);
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  if (!isOpen || !worker) return null;

  const totalAmount = (worker.hourly_rate || 350) * durationHours;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrorMsg('Please login to create a booking.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter the service address / location.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const scheduledDateTime = new Date(`${date}T10:00:00Z`).toISOString();
      const res = await fetchWithAuth('/v1/bookings/', {
        method: 'POST',
        body: JSON.stringify({
          worker_id: worker.id,
          scheduled_date: scheduledDateTime,
          duration_type: `${durationHours} Hours`,
          agreed_amount: totalAmount,
          currency: 'INR',
          service_address: address.trim(),
          work_description: description.trim() || `Hired ${worker.profession} services for ${durationHours} hours`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBookingSuccess(data);
        if (onSuccess) onSuccess(data);
      } else {
        const err = await res.json();
        setErrorMsg(err.detail || 'Failed to submit booking request. Please try again.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Book Skilled Worker</h3>
              <p className="text-xs text-slate-300">Escrow protected on-demand labour</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success State */}
        {bookingSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">Booking Request Created!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Your request for <strong>{worker.name}</strong> has been submitted. The worker has been notified and will confirm the schedule.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs text-slate-700 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">Booking ID:</span>
                <span className="font-mono font-bold text-slate-900">{bookingSuccess.booking_id?.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Escrow Amount:</span>
                <span className="font-bold text-emerald-700">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">PENDING CONFIRMATION</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Close
              </button>
              <Link 
                href="/dashboard"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-md shadow-blue-500/20"
              >
                View in Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmitBooking} className="p-6 space-y-4">
            
            {/* Worker Preview Card */}
            <div className="flex items-center space-x-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base flex-shrink-0 overflow-hidden">
                {worker.photo ? (
                  <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover" />
                ) : (
                  worker.name.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{worker.name}</h4>
                  {worker.verified && <ShieldCheck size={15} className="text-blue-600 flex-shrink-0" />}
                </div>
                <div className="text-xs text-indigo-600 font-semibold">{worker.profession}</div>
                <div className="text-[11px] text-slate-500 font-mono">Rate: ₹{worker.hourly_rate}/hr</div>
              </div>
            </div>

            {/* Date & Duration Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Service Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Expected Duration
                </label>
                <select
                  value={durationHours}
                  onChange={e => setDurationHours(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value={1}>1 Hour (Quick Service)</option>
                  <option value={2}>2 Hours (Standard)</option>
                  <option value={4}>4 Hours (Half Day)</option>
                  <option value={8}>8 Hours (Full Day Shift)</option>
                </select>
              </div>
            </div>

            {/* Service Location */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Work Site / Address Location
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Sector 62, Noida"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Work Requirements */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Work Scope / Instructions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Describe the tasks, repair items, or materials available..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Price Breakdown Banner */}
            <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-900 font-medium">Estimated Escrow Total:</span>
                <div className="text-[11px] text-indigo-600">₹{worker.hourly_rate} × {durationHours} hours</div>
              </div>
              <div className="text-xl font-black text-indigo-950 font-mono">
                ₹{totalAmount}
              </div>
            </div>

            {/* Escrow Guarantee Pill */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <Lock size={14} className="text-emerald-600 flex-shrink-0" />
              <span>Funds remain safely locked in escrow until you approve job completion.</span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertTriangle size={14} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            {!isAuthenticated ? (
              <div className="pt-2">
                <Link 
                  href="/login" 
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  Log In to Confirm Booking
                </Link>
              </div>
            ) : (
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  <Send size={14} />
                  {isSubmitting ? 'Booking...' : `Confirm & Lock ₹${totalAmount}`}
                </button>
              </div>
            )}

          </form>
        )}

      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import BookingModal, { BookingWorkerInfo } from './BookingModal';
import { Calendar, ShieldCheck, Zap } from 'lucide-react';

interface WorkerProfileBookingProps {
  worker: BookingWorkerInfo;
}

export default function WorkerProfileBooking({ worker }: WorkerProfileBookingProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
        <Calendar size={18} />
        <span>Book {worker.name} Now</span>
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
        <ShieldCheck size={14} className="text-blue-600" />
        <span>100% Escrow Protection Guaranteed</span>
      </div>

      <BookingModal
        worker={worker}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}

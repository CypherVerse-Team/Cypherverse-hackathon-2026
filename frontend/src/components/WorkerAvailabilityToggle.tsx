'use client';

import { useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface WorkerAvailabilityToggleProps {
  workerId: string;
  initialAvailability: boolean;
  onUpdate?: () => void;
}

export default function WorkerAvailabilityToggle({
  workerId,
  initialAvailability,
  onUpdate
}: WorkerAvailabilityToggleProps) {
  const [isAvailable, setIsAvailable] = useState(initialAvailability);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleToggle = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // Send a PUT/PATCH request to /api/workers/{workerId} (fetchWithAuth prefixes /api automatically)
      const res = await fetchWithAuth(`/workers/${workerId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_available: !isAvailable })
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        setIsAvailable(updatedProfile.is_available);
        if (onUpdate) {
          onUpdate();
        }
      } else {
        const error = await res.json();
        setErrorMsg(error.detail || 'Failed to update availability status.');
      }
    } catch {
      setErrorMsg('Error updating availability status.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Worker Status</h3>
        <p className="text-sm text-gray-500 mt-1">
          Toggle your online presence. When offline, customers won&apos;t see you in searches or search filters.
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`w-full sm:w-36 text-center py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 disabled:opacity-80 flex items-center justify-center space-x-2 select-none cursor-pointer ${
            isAvailable
              ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:bg-emerald-600'
              : 'bg-slate-600 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{isAvailable ? 'ONLINE' : 'OFFLINE'}</span>
          )}
        </button>

        {errorMsg && (
          <span className="text-xs font-semibold text-red-600 mt-1">
            {errorMsg}
          </span>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

export default function BookingModal({ workerId, basePrice }: { workerId: string, basePrice: number }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState('');
  const [durationType, setDurationType] = useState('<2hrs');
  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState('');

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth('/v1/bookings/', {
        method: 'POST',
        body: JSON.stringify({
          worker_id: workerId,
          scheduled_date: new Date(date).toISOString(),
          duration_type: durationType,
          agreed_amount: basePrice,
          currency: 'INR',
          service_address_id: address
        })
      });
      if (res.ok) {
        setMsg('Booking requested successfully!');
        setTimeout(() => {
          setIsOpen(false);
          router.push('/dashboard');
        }, 1500);
      } else {
        const data = await res.json();
        setMsg(data.detail || 'Failed to request booking');
      }
    } catch (e) {
      setMsg('Failed to request booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => {
          if (!isAuthenticated) router.push('/login');
          else setIsOpen(true);
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors mb-3"
      >
        Book Now
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Request Service</h2>
            
            {msg && <div className="mb-4 text-sm font-medium text-blue-600">{msg}</div>}
            
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">When do you need them?</label>
                <input 
                  type="datetime-local" 
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg"
                  value={durationType}
                  onChange={e => setDurationType(e.target.value)}
                >
                  <option value="<2hrs">Less than 2 hours</option>
                  <option value="Half Day">Half Day (4 hours)</option>
                  <option value="Full Day">Full Day (8 hours)</option>
                  <option value="Multi-Day">Multiple Days</option>
                  <option value="Project-based">Project Based</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Address / Location</label>
                <textarea 
                  required
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter your full address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Requesting...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

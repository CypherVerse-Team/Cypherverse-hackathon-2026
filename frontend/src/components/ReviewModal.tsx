'use client';

import { useState } from 'react';
import { fetchWithAuth } from '@/lib/api';

export default function ReviewModal({ bookingId, onClose, onReviewSubmitted }: { bookingId: string, onClose: () => void, onReviewSubmitted: () => void }) {
  const [quality, setQuality] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(`/v1/bookings/${bookingId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          quality_rating: quality,
          punctuality_rating: punctuality,
          communication_rating: communication,
          professionalism_rating: professionalism,
          review_text: text
        })
      });
      if (res.ok) {
        onReviewSubmitted();
      } else {
        const error = await res.json();
        setMsg(error.detail || 'Failed to submit review');
      }
    } catch (e) {
      setMsg('Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (label: string, val: number, setVal: (v: number) => void) => (
    <div className="flex justify-between items-center text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <div className="flex space-x-1">
        {[1,2,3,4,5].map(star => (
          <button type="button" key={star} onClick={() => setVal(star)} className={`text-xl ${star <= val ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Rate your experience</h2>
        {msg && <div className="mb-4 text-sm font-medium text-red-600">{msg}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            {renderStars('Quality of Work', quality, setQuality)}
            {renderStars('Punctuality', punctuality, setPunctuality)}
            {renderStars('Communication', communication, setCommunication)}
            {renderStars('Professionalism', professionalism, setProfessionalism)}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Written Feedback</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Tell us about the service..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>

          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

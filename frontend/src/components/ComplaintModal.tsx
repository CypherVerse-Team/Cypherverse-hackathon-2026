'use client';

import { useState } from 'react';
import { fetchWithAuth } from '@/lib/api';

export default function ComplaintModal({ bookingId, onClose, onComplaintSubmitted }: { bookingId: string, onClose: () => void, onComplaintSubmitted: () => void }) {
  const [category, setCategory] = useState('Quality of work');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('booking_id', bookingId);
      formData.append('complaint_category', category);
      formData.append('description', description);
      if (file) {
        formData.append('file', file);
      }

      const res = await fetchWithAuth('/v1/complaints/', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        onComplaintSubmitted();
      } else {
        const error = await res.json();
        setMsg(error.detail || 'Failed to file complaint');
      }
    } catch (e) {
      setMsg('Error filing complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-red-600">File a Complaint / Dispute</h2>
        {msg && <div className="mb-4 text-sm font-medium text-red-600">{msg}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              className="w-full px-3 py-2 border rounded-lg"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="Non-completion">Non-completion of Job</option>
              <option value="Quality of work">Poor Quality of Work</option>
              <option value="Payment dispute">Payment Dispute</option>
              <option value="Misconduct">Misconduct / Unprofessional Behavior</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              required
              rows={4}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Describe what happened in detail..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evidence (Optional)</label>
            <input 
              type="file" 
              className="w-full text-sm"
              accept="image/*,.pdf"
              onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
            />
            <p className="text-xs text-gray-500 mt-1">Upload photos or documents to support your claim.</p>
          </div>

          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

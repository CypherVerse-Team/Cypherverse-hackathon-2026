'use client';

import { useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { XCircle, Plus, Trash2 } from 'lucide-react';

export default function BulkRequestModal({ onClose, onRequestSubmitted }: { onClose: () => void, onRequestSubmitted: () => void }) {
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [requirements, setRequirements] = useState([{ profession: '', quantity: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const handleAddReq = () => setRequirements([...requirements, { profession: '', quantity: 1 }]);
  
  const handleRemoveReq = (idx: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== idx));
    }
  };

  const updateReq = (idx: number, field: string, val: string | number) => {
    const updated = [...requirements];
    updated[idx] = { ...updated[idx], [field]: val };
    setRequirements(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetchWithAuth('/v1/contractors/bulk-requests', {
        method: 'POST',
        body: JSON.stringify({
          project_name: projectName,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          requirements
        })
      });
      
      if (res.ok) {
        onRequestSubmitted();
      } else {
        const error = await res.json();
        setMsg(error.detail || 'Failed to submit request');
      }
    } catch (e) {
      setMsg('Error submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Create Bulk Workforce Request</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-200 p-2 rounded-lg">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-auto">
          {msg && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">{msg}</div>}
          
          <form id="bulk-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input 
                required
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Phase 2 Residential Construction"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                  required
                  type="datetime-local"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input 
                  required
                  type="datetime-local"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Workforce Requirements</label>
                <button type="button" onClick={handleAddReq} className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center">
                  <Plus className="w-4 h-4 mr-1" /> Add Role
                </button>
              </div>
              
              <div className="space-y-3">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex space-x-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex-1">
                      <input 
                        required
                        type="text"
                        placeholder="Profession (e.g. Plumber, Electrician)"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        value={req.profession}
                        onChange={e => updateReq(idx, 'profession', e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <input 
                        required
                        type="number"
                        min="1"
                        placeholder="Qty"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        value={req.quantity}
                        onChange={e => updateReq(idx, 'quantity', parseInt(e.target.value))}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRemoveReq(idx)}
                      className="text-red-500 hover:text-red-700 p-2"
                      disabled={requirements.length === 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">
            Cancel
          </button>
          <button form="bulk-form" type="submit" disabled={isSubmitting} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50">
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

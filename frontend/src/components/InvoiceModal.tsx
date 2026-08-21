'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { XCircle, Download, FileText } from 'lucide-react';

export default function InvoiceModal({ bookingId, onClose }: { bookingId: string, onClose: () => void }) {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvoice();
  }, [bookingId]);

  const loadInvoice = async () => {
    try {
      const res = await fetchWithAuth(`/v1/bookings/${bookingId}/invoice`);
      if (res.ok) {
        setInvoice(await res.json());
      } else {
        const errData = await res.json();
        setError(errData.detail || 'Invoice not found.');
      }
    } catch (e) {
      setError('Error loading invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-indigo-600" /> Booking Invoice
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-200 p-2 rounded-lg">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-auto">
          {loading ? (
            <div className="text-center text-gray-500 py-10">Loading invoice...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">SHRAMSETU</h3>
                  <p className="text-sm text-gray-500 mt-1">Invoice Receipt</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-800">#{invoice.invoice_number}</div>
                  <div className="text-xs text-gray-500">{new Date(invoice.date_issued).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="pt-2 space-y-2 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span>Booking Reference:</span>
                  <span className="font-mono">{invoice.booking_id.split('-')[0].toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold text-green-600">{invoice.status}</span>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Amount Paid</span>
                  <span>₹{invoice.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center mt-6 text-xs text-gray-400">
                This is a computer generated invoice and requires no signature.
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
          <button onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">
            Close
          </button>
          {!loading && !error && (
            <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

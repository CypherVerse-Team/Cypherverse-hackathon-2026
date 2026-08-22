'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api';
import { ShieldCheck, FileCheck, Upload, AlertCircle, CheckCircle2, Clock, XCircle, Award, UserCheck } from 'lucide-react';
import Link from 'next/link';
import AccountQuickHub from '@/components/AccountQuickHub';

export default function VerificationPage() {
  const { user, isAuthenticated } = useAuth();
  
  const [docType, setDocType] = useState('Aadhaar Card');
  const [file, setFile] = useState<File | null>(null);
  const [verStatus, setVerStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/v1/verification/status');
      if (res.ok) {
        setVerStatus(await res.json());
      } else {
        setVerStatus(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMsg({ type: 'error', text: 'Please select a document file to upload.' });
      return;
    }
    setMsg(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('document_type', docType);
      formData.append('file', file);

      const res = await fetchWithAuth('/v1/verification/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setMsg({ type: 'success', text: 'Verification document uploaded successfully!' });
        setFile(null);
        loadStatus();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.detail || 'Failed to upload document' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <ShieldCheck className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Digital KYC & Verification Portal</h2>
        <p className="text-gray-600 mb-6">Please log in to submit identity verification documents and earn the ShramSetu Verified Badge.</p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm inline-block">
          Log In Now
        </Link>
      </div>
    );
  }

  const currentStatus = verStatus?.status || user?.verification_status || 'UNVERIFIED';

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">KYC & Skill Verification Portal</h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Verified workers receive priority job listings, higher hourly rates, and the official ShramSetu Gold Badge.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Award className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Status: {currentStatus}
        </span>
      </div>

          {msg && (
            <div className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-semibold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{msg.text}</span>
            </div>
          )}
          {/* Verification Form & Status */}
          <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Submit Verification Documents</h2>
                <p className="text-xs text-gray-500">Supported formats: PDF, JPG, PNG (Max 5MB)</p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Document Type</label>
                <select 
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Aadhaar Card">Aadhaar Card (Govt ID)</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Voter ID">Voter ID Card</option>
                  <option value="Trade Skill Certificate">Trade / Vocational Skill Certificate</option>
                  <option value="Contractor License">Contractor License Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Upload File / Document</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm mt-4 flex items-center justify-center"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading Document...' : 'Submit Document for Review'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Verification Guidelines & Perks</h3>
            
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              {currentStatus === 'VERIFIED' ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">Account Fully Verified</h4>
                    <p className="text-xs text-gray-500">Your profile badge is active and visible across the marketplace.</p>
                  </div>
                </>
              ) : (currentStatus === 'PENDING' || currentStatus === 'UNDER_REVIEW') ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">Verification Under Review</h4>
                    <p className="text-xs text-gray-500">Our admin team is validating your documents (12-24h turnaround).</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">Unverified Account</h4>
                    <p className="text-xs text-gray-500">Upload your ID card above to unlock verified badge perks.</p>
                  </div>
                </>
              )}
            </div>

            <ul className="space-y-2.5 text-xs text-gray-600">
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" /> Blue Verification Shield on directory search
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" /> 3x higher booking request frequency from customers
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" /> Priority access to contractor enterprise projects
              </li>
            </ul>
          </div>
        </div>

    </div>
  );
}

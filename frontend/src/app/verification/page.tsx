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

    const formData = new FormData();
    formData.append('document_type', docType);
    formData.append('file', file);

    try {
      const res = await fetchWithAuth('/v1/verification/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setMsg({ type: 'success', text: 'Verification document uploaded successfully! Status set to PENDING.' });
        setFile(null);
        loadStatus();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.detail || 'Failed to upload verification document' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'An error occurred during upload' });
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-8 sm:p-10 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md mb-3">
              <Award className="w-3.5 h-3.5 mr-1 text-yellow-300" /> ShramSetu Trust & Safety Standard
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">KYC & Skill Verification Portal</h1>
            <p className="text-blue-100 text-sm mt-1">
              Verified workers receive priority job listings, higher hourly rates, and the official ShramSetu Gold Badge.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-right">
            <span className="text-xs text-blue-200 block">Current Status</span>
            <span className="text-base font-extrabold text-white uppercase">{currentStatus}</span>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Verification Upload Form */}
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
              <label className="block text-xs font-bold text-gray-700 mb-1">Upload File Document</label>
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={currentStatus === 'PENDING' || currentStatus === 'UNDER_REVIEW'}
              className={`w-full font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm ${
                currentStatus === 'PENDING' || currentStatus === 'UNDER_REVIEW'
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {currentStatus === 'PENDING' || currentStatus === 'UNDER_REVIEW' 
                ? 'Verification Request Under Review' 
                : 'Upload & Submit for Verification'}
            </button>
          </form>
        </div>

        {/* Verification Status Card & Perks */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FileCheck className="w-5 h-5 mr-2 text-blue-600" /> Verification Status Tracker
            </h3>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center space-x-4 mb-6">
              {currentStatus === 'VERIFIED' && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-800 text-base">Fully Verified</h4>
                    <p className="text-xs text-emerald-600">Your digital identity & skill credentials have been approved.</p>
                  </div>
                </>
              )}

              {(currentStatus === 'PENDING' || currentStatus === 'UNDER_REVIEW') && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-800 text-base">Under Review</h4>
                    <p className="text-xs text-amber-600">Our admin team is inspecting your uploaded document hash.</p>
                  </div>
                </>
              )}

              {currentStatus === 'REJECTED' && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                    <XCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-800 text-base">Verification Rejected</h4>
                    <p className="text-xs text-red-600">{verStatus?.rejection_reason || 'Document unreadable or invalid.'}</p>
                  </div>
                </>
              )}

              {currentStatus === 'UNVERIFIED' && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-base">Unverified Account</h4>
                    <p className="text-xs text-gray-500">Upload your ID card above to unlock verified badge perks.</p>
                  </div>
                </>
              )}
            </div>

            {/* Perks List */}
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Verified Worker Benefits</h4>
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

          <AccountQuickHub />
        </div>

      </div>
    </div>
  );
}

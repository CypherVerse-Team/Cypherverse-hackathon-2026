'use client';

import React, { useState, useMemo } from 'react';
import SummaryStatsCard, { ColumnSummaryOption } from '@/components/SummaryStatsCard';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Upload, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  Table as TableIcon, 
  RefreshCw,
  Plus,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';

// Preset Datasets for exploration
const SAMPLE_BOOKINGS_DATA = [
  { booking_id: 'BK-101', service_type: 'Electrical Repair', amount: 1500, service_fee: 150, worker_rating: 4.8, distance_km: 3.2, duration_hours: 2.5 },
  { booking_id: 'BK-102', service_type: 'Plumbing Works', amount: 2800, service_fee: 280, worker_rating: 4.5, distance_km: 5.1, duration_hours: 4.0 },
  { booking_id: 'BK-103', service_type: 'Carpentry Framing', amount: 4500, service_fee: 450, worker_rating: 4.9, distance_km: 8.0, duration_hours: 6.5 },
  { booking_id: 'BK-104', service_type: 'House Painting', amount: 12000, service_fee: 1200, worker_rating: 4.2, distance_km: 12.4, duration_hours: 16.0 },
  { booking_id: 'BK-105', service_type: 'AC Servicing', amount: 1800, service_fee: 180, worker_rating: 4.7, distance_km: 2.5, duration_hours: 1.5 },
  { booking_id: 'BK-106', service_type: 'Tile Fitting', amount: 8500, service_fee: 850, worker_rating: 4.6, distance_km: 6.7, duration_hours: 10.0 },
  { booking_id: 'BK-107', service_type: 'Masonry Work', amount: 9200, service_fee: 920, worker_rating: 4.9, distance_km: 15.0, duration_hours: 12.0 },
  { booking_id: 'BK-108', service_type: 'Welding & Steel', amount: 3400, service_fee: 340, worker_rating: 4.4, distance_km: 4.3, duration_hours: 3.5 },
  { booking_id: 'BK-109', service_type: 'Cleaning Service', amount: 1200, service_fee: 120, worker_rating: 4.8, distance_km: 1.8, duration_hours: 2.0 },
  { booking_id: 'BK-110', service_type: 'RO Purifier Repair', amount: 950, service_fee: 95, worker_rating: 4.3, distance_km: 3.0, duration_hours: 1.0 },
  { booking_id: 'BK-111', service_type: 'Civil Renovation', amount: 25000, service_fee: 2500, worker_rating: 5.0, distance_km: 18.5, duration_hours: 35.0 },
  { booking_id: 'BK-112', service_type: 'Wiring & Fixtures', amount: 3200, service_fee: 320, worker_rating: 4.6, distance_km: 7.2, duration_hours: 4.5 },
];

const SAMPLE_WORKERS_DATA = [
  { worker_id: 'W-01', name: 'Rajesh Kumar', hourly_rate: 350, daily_rate: 2500, experience_years: 8, jobs_completed: 142, rating: 4.9, verification_score: 98 },
  { worker_id: 'W-02', name: 'Sunil Sharma', hourly_rate: 280, daily_rate: 2000, experience_years: 5, jobs_completed: 89, rating: 4.6, verification_score: 92 },
  { worker_id: 'W-03', name: 'Amit Verma', hourly_rate: 420, daily_rate: 3200, experience_years: 12, jobs_completed: 215, rating: 4.95, verification_score: 100 },
  { worker_id: 'W-04', name: 'Ramesh Patel', hourly_rate: 300, daily_rate: 2200, experience_years: 4, jobs_completed: 64, rating: 4.4, verification_score: 88 },
  { worker_id: 'W-05', name: 'Vikas Yadav', hourly_rate: 380, daily_rate: 2800, experience_years: 7, jobs_completed: 118, rating: 4.75, verification_score: 95 },
  { worker_id: 'W-06', name: 'Deepak Singh', hourly_rate: 250, daily_rate: 1800, experience_years: 2, jobs_completed: 31, rating: 4.3, verification_score: 85 },
  { worker_id: 'W-07', name: 'Manoj Carpenter', hourly_rate: 400, daily_rate: 3000, experience_years: 10, jobs_completed: 180, rating: 4.85, verification_score: 97 },
  { worker_id: 'W-08', name: 'Sanjay Electric', hourly_rate: 450, daily_rate: 3400, experience_years: 14, jobs_completed: 260, rating: 4.98, verification_score: 99 },
];

const SAMPLE_CONTRACTOR_DATA = [
  { team_id: 'T-1', team_name: 'Apex Infra Crew', members_count: 15, hourly_budget: 4500, active_projects: 4, safety_score: 96, completion_days_avg: 14.5 },
  { team_id: 'T-2', team_name: 'BuildTech Builders', members_count: 24, hourly_budget: 7200, active_projects: 7, safety_score: 98, completion_days_avg: 21.0 },
  { team_id: 'T-3', team_name: 'Urban Plumbers Guild', members_count: 8, hourly_budget: 2400, active_projects: 3, safety_score: 91, completion_days_avg: 6.2 },
  { team_id: 'T-4', team_name: 'Metro Electricians', members_count: 12, hourly_budget: 3800, active_projects: 5, safety_score: 94, completion_days_avg: 9.8 },
  { team_id: 'T-5', team_name: 'Supreme Finishers', members_count: 18, hourly_budget: 5500, active_projects: 6, safety_score: 97, completion_days_avg: 18.2 },
];

export default function AnalyticsPage() {
  const [activeDatasetTab, setActiveDatasetTab] = useState<'bookings' | 'workers' | 'teams' | 'custom'>('bookings');
  
  // Custom uploaded/parsed dataset
  const [customData, setCustomData] = useState<Record<string, any>[]>([]);
  const [rawTextInput, setRawTextInput] = useState<string>('120, 250, 310, 310, 450, 520, 680, 740, 890, 1050');
  const [customColName, setCustomColName] = useState<string>('sample_values');

  // Currently active dataset object array
  const currentDataset = useMemo(() => {
    switch (activeDatasetTab) {
      case 'bookings': return SAMPLE_BOOKINGS_DATA;
      case 'workers': return SAMPLE_WORKERS_DATA;
      case 'teams': return SAMPLE_CONTRACTOR_DATA;
      case 'custom': return customData.length > 0 ? customData : parseRawNumbers(rawTextInput, customColName);
    }
  }, [activeDatasetTab, customData, rawTextInput, customColName]);

  // Helper to parse raw comma/space separated text into dataset
  function parseRawNumbers(text: string, colName: string): Record<string, any>[] {
    const nums = text
      .split(/[\s,;\n]+/)
      .map(s => Number(s.trim()))
      .filter(n => !isNaN(n));

    return nums.map((val, idx) => ({
      index: idx + 1,
      [colName]: val
    }));
  }

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) return;

      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      const rows: Record<string, any>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        const rowObj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          const val = values[idx];
          if (val !== undefined && val !== '') {
            const num = Number(val);
            rowObj[h] = !isNaN(num) ? num : val;
          }
        });
        rows.push(rowObj);
      }

      setCustomData(rows);
      setActiveDatasetTab('custom');
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 sm:py-6 font-sans">
      
      {/* Page Title Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold backdrop-blur-md mb-4 border border-blue-500/30">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> ShramSetu Intelligence & Wage Statistics
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Worker Wage & Booking Summary Statistics
          </h1>
          <p className="text-slate-300 mt-2 text-sm sm:text-base leading-relaxed">
            Analyze ShramSetu platform metrics across worker hourly rates, escrow booking amounts, star ratings, and contractor crew sizes. Select any numeric column to compute **Mean, Median, Mode, Variance, Standard Deviation, and Min/Max**.
          </p>
        </div>
      </div>

      {/* Dataset Selection Tabs & Source Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" /> ShramSetu Platform Datasets
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a live platform dataset or upload a custom CSV table
            </p>
          </div>

          {/* Dataset Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveDatasetTab('bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeDatasetTab === 'bookings' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              💼 Escrow Bookings & Revenue
            </button>
            <button
              onClick={() => setActiveDatasetTab('workers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeDatasetTab === 'workers' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              👷 Worker Wages & Ratings
            </button>
            <button
              onClick={() => setActiveDatasetTab('teams')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeDatasetTab === 'teams' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              🏢 Contractor Crew Metrics
            </button>
            <button
              onClick={() => setActiveDatasetTab('custom')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeDatasetTab === 'custom' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              📁 Custom CSV / Wages
            </button>
          </div>
        </div>

        {/* Custom Data Input Modal / Controls */}
        {activeDatasetTab === 'custom' && (
          <div className="mt-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            {/* Raw Text Input */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                Paste Numeric Numbers (Comma or space separated)
              </label>
              <textarea
                rows={4}
                value={rawTextInput}
                onChange={(e) => {
                  setRawTextInput(e.target.value);
                  setCustomData([]);
                }}
                placeholder="e.g. 350, 400, 450, 280, 500, 320"
                className="w-full text-xs font-mono p-3 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Column Name:
                </span>
                <input
                  type="text"
                  value={customColName}
                  onChange={(e) => setCustomColName(e.target.value)}
                  className="text-xs font-bold px-2.5 py-1 bg-white rounded-lg border border-slate-300 text-slate-800"
                />
              </div>
            </div>

            {/* CSV File Upload Box */}
            <div className="flex flex-col justify-center items-center p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-white text-center hover:border-indigo-400 transition-colors">
              <Upload className="w-10 h-10 text-indigo-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">Upload ShramSetu CSV Dataset</h4>
              <p className="text-xs text-slate-500 mb-4 max-w-xs">
                Upload any worker wage or booking CSV dataset to automatically parse numerical columns.
              </p>
              <label className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-sm transition-all inline-flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" /> Browse CSV File
                <input
                  type="file"
                  accept=".csv, text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {customData.length > 0 && (
                <span className="text-xs text-emerald-600 font-bold mt-2">
                  ✓ Successfully loaded {customData.length} CSV records!
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AUTOMATED SUMMARY STATISTICS CARD (Main Feature) */}
      <SummaryStatsCard
        data={currentDataset}
        title={`ShramSetu Summary Statistics (${activeDatasetTab.toUpperCase()})`}
        subtitle="Select any numeric column to compute exact mean, median, mode, variance, standard deviation & min/max boundaries"
      />

      {/* Dataset Preview Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-indigo-600" /> Current Dataset Row Records Preview ({currentDataset.length} rows)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Showing first {Math.min(currentDataset.length, 10)} records
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                {Object.keys(currentDataset[0] || {}).map((key) => (
                  <th key={key} className="p-3 whitespace-nowrap">
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentDataset.slice(0, 10).map((row: any, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  {Object.keys(currentDataset[0] || {}).map((key) => (
                    <td key={key} className="p-3 text-slate-700 font-medium whitespace-nowrap">
                      {typeof row[key] === 'number' ? row[key].toLocaleString() : String(row[key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

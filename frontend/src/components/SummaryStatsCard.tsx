'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  BarChart2, 
  Hash, 
  TrendingUp, 
  Layers, 
  Sliders, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  ChevronDown, 
  Sparkles,
  Info,
  HelpCircle,
  Download,
  RotateCcw
} from 'lucide-react';

export interface ColumnSummaryOption {
  key: string;
  label?: string;
  unit?: string;
}

export interface SummaryStatsCardProps {
  /** Array of row objects (e.g. [{ price: 100, count: 2 }, ...]) */
  data?: Record<string, any>[];
  /** Direct numeric array if no row objects */
  numericArray?: number[];
  /** Optional title for the card */
  title?: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Pre-selected column key */
  defaultColumnKey?: string;
  /** Available numeric columns list (auto-detected if omitted) */
  columns?: ColumnSummaryOption[];
  /** Class name overrides */
  className?: string;
  /** Callback when column selection changes */
  onColumnSelect?: (columnKey: string) => void;
}

export interface StatsResult {
  count: number;
  min: number;
  max: number;
  range: number;
  sum: number;
  mean: number;
  median: number;
  modes: number[];
  modeFreq: number;
  isMultimodal: boolean;
  hasNoMode: boolean;
  sampleVariance: number;
  popVariance: number;
  variance: number;
  sampleStdDev: number;
  popStdDev: number;
  stdDev: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  skewType: 'Symmetric' | 'Right-skewed' | 'Left-skewed';
  histogramBins: { binMin: number; binMax: number; count: number; percentage: number }[];
}

/**
 * Computes exact statistical metrics from a numeric array
 */
export function calculateSummaryStats(values: number[], isSampleVariance: boolean = true): StatsResult | null {
  const valid = values.filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v));
  if (valid.length === 0) return null;

  const count = valid.length;
  const sorted = [...valid].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[count - 1];
  const range = max - min;

  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / count;

  // Median calculation
  let median: number;
  const mid = Math.floor(count / 2);
  if (count % 2 === 1) {
    median = sorted[mid];
  } else {
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  }

  // Mode calculation
  const freqMap: Record<number, number> = {};
  let maxFreq = 0;
  sorted.forEach(v => {
    freqMap[v] = (freqMap[v] || 0) + 1;
    if (freqMap[v] > maxFreq) maxFreq = freqMap[v];
  });

  const modes: number[] = [];
  Object.entries(freqMap).forEach(([valStr, freq]) => {
    if (freq === maxFreq) {
      modes.push(Number(valStr));
    }
  });

  const hasNoMode = maxFreq === 1 && count > 1;
  const isMultimodal = modes.length > 1 && !hasNoMode;

  // Variance & Standard Deviation
  const ss = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const sampleVariance = count > 1 ? ss / (count - 1) : 0;
  const popVariance = ss / count;
  const variance = isSampleVariance ? sampleVariance : popVariance;

  const sampleStdDev = Math.sqrt(sampleVariance);
  const popStdDev = Math.sqrt(popVariance);
  const stdDev = isSampleVariance ? sampleStdDev : popStdDev;

  // Percentiles Q1 & Q3
  const getPercentile = (p: number) => {
    if (count === 1) return sorted[0];
    const index = p * (count - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const q1 = getPercentile(0.25);
  const q3 = getPercentile(0.75);
  const iqr = q3 - q1;

  // Pearson Median Skewness
  const skewness = stdDev > 0 ? (3 * (mean - median)) / stdDev : 0;
  let skewType: 'Symmetric' | 'Right-skewed' | 'Left-skewed' = 'Symmetric';
  if (skewness > 0.3) skewType = 'Right-skewed';
  else if (skewness < -0.3) skewType = 'Left-skewed';

  // Histogram Binning
  const numBins = Math.min(10, Math.max(5, Math.ceil(Math.sqrt(count))));
  const binWidth = range === 0 ? 1 : range / numBins;
  const bins = Array.from({ length: numBins }, (_, i) => ({
    binMin: min + i * binWidth,
    binMax: i === numBins - 1 ? max : min + (i + 1) * binWidth,
    count: 0,
    percentage: 0
  }));

  sorted.forEach(v => {
    let binIdx = Math.floor((v - min) / binWidth);
    if (binIdx >= numBins) binIdx = numBins - 1;
    if (binIdx < 0) binIdx = 0;
    bins[binIdx].count++;
  });

  bins.forEach(b => {
    b.percentage = (b.count / count) * 100;
  });

  return {
    count,
    min,
    max,
    range,
    sum,
    mean,
    median,
    modes,
    modeFreq: maxFreq,
    isMultimodal,
    hasNoMode,
    sampleVariance,
    popVariance,
    variance,
    sampleStdDev,
    popStdDev,
    stdDev,
    q1,
    q3,
    iqr,
    skewness,
    skewType,
    histogramBins: bins
  };
}

// ShramSetu domain column metadata mapping for realistic project integration
const SHRAMSETU_COLUMN_META: Record<string, { label: string; unit: string; prefix?: string }> = {
  hourly_rate: { label: 'Worker Hourly Wage', unit: '₹/hr', prefix: '₹' },
  daily_rate: { label: 'Worker Daily Rate', unit: '₹/day', prefix: '₹' },
  amount: { label: 'Escrow Booking Amount', unit: '₹', prefix: '₹' },
  service_fee: { label: 'ShramSetu Platform Fee', unit: '₹', prefix: '₹' },
  worker_rating: { label: 'Worker Star Rating', unit: '★' },
  rating: { label: 'Average Worker Rating', unit: '★' },
  average_rating: { label: 'Average Rating', unit: '★' },
  jobs_completed: { label: 'Completed Labour Jobs', unit: 'jobs' },
  completed_jobs: { label: 'Completed Jobs', unit: 'jobs' },
  experience_years: { label: 'Trade Work Experience', unit: 'yrs' },
  distance_km: { label: 'Site Proximity Distance', unit: 'km' },
  duration_hours: { label: 'Job Booking Duration', unit: 'hrs' },
  members_count: { label: 'Contractor Crew Members', unit: 'workers' },
  team_capacity: { label: 'Crew Team Capacity', unit: 'workers' },
  hourly_budget: { label: 'Project Hourly Budget', unit: '₹/hr', prefix: '₹' },
  verification_score: { label: 'KYC & Skill Verification Score', unit: '%' },
  safety_score: { label: 'Site Safety Audit Rating', unit: '%' },
  total_revenue: { label: 'Platform Revenue Volume', unit: '₹', prefix: '₹' },
  revenue: { label: 'Revenue Generated', unit: '₹', prefix: '₹' },
  pending_kyc: { label: 'Pending KYC Verifications', unit: 'users' },
  count: { label: 'Entity Observations Count', unit: 'items' },
};

export default function SummaryStatsCard({
  data = [],
  numericArray,
  title = "ShramSetu Skilled Labour & Booking Matrix Analytics",
  subtitle = "Automated statistical analysis of worker wages, escrow payments, ratings & contractor metrics",
  defaultColumnKey,
  columns: providedColumns,
  className = "",
  onColumnSelect
}: SummaryStatsCardProps) {
  
  // Auto-detect numeric columns if dataset is provided
  const detectedColumns = useMemo(() => {
    if (providedColumns && providedColumns.length > 0) return providedColumns;
    if (!data || data.length === 0) return [];

    const keys = Object.keys(data[0] || {});
    const numericKeys: ColumnSummaryOption[] = [];

    keys.forEach(key => {
      // Check if at least one row has a valid numeric value for this key
      const hasNumeric = data.some(row => {
        const val = row[key];
        return typeof val === 'number' || (!isNaN(Number(val)) && val !== '' && val !== null && typeof val !== 'boolean');
      });

      if (hasNumeric) {
        // Pretty label formatting with ShramSetu domain context
        const domainMeta = SHRAMSETU_COLUMN_META[key];
        const label = domainMeta?.label || key
          .replace(/_/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
        numericKeys.push({ key, label, unit: domainMeta?.unit });
      }
    });

    return numericKeys;
  }, [data, providedColumns]);

  // Selected column state
  const [selectedColKey, setSelectedColKey] = useState<string>(() => {
    if (defaultColumnKey) return defaultColumnKey;
    if (detectedColumns.length > 0) return detectedColumns[0].key;
    return 'values';
  });

  // Variance formula toggle: sample (n-1) vs population (n)
  const [isSampleVariance, setIsSampleVariance] = useState<boolean>(true);

  // Decimal precision selector (0, 2, 4)
  const [precision, setPrecision] = useState<number>(2);

  // Copy notification toast
  const [copiedMetric, setCopiedMetric] = useState<string | null>(null);

  // Expand / collapse detailed view
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Extract raw numbers based on selected column key or numericArray
  const extractedNumbers = useMemo(() => {
    if (numericArray && numericArray.length > 0) {
      return numericArray;
    }
    if (!data || data.length === 0) return [];

    return data
      .map(row => {
        const val = row[selectedColKey];
        if (typeof val === 'number') return val;
        if (val !== null && val !== undefined && val !== '') {
          const num = Number(val);
          if (!isNaN(num)) return num;
        }
        return NaN;
      })
      .filter(v => !isNaN(v));
  }, [data, numericArray, selectedColKey]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateSummaryStats(extractedNumbers, isSampleVariance);
  }, [extractedNumbers, isSampleVariance]);

  // Handle column dropdown switch
  const handleColumnChange = (key: string) => {
    setSelectedColKey(key);
    if (onColumnSelect) onColumnSelect(key);
  };

  const selectedColObj = detectedColumns.find(c => c.key === selectedColKey);
  const domainMeta = SHRAMSETU_COLUMN_META[selectedColKey];
  const selectedColLabel = domainMeta?.label || selectedColObj?.label || selectedColKey;
  const colUnit = domainMeta?.unit || selectedColObj?.unit || '';
  const colPrefix = domainMeta?.prefix || '';

  // Helper for formatting output numbers with ShramSetu domain units
  const fmt = (val: number | undefined | null, includeUnit: boolean = true): string => {
    if (val === undefined || val === null || isNaN(val)) return 'N/A';
    const formattedNum = (Number.isInteger(val) && precision === 0) 
      ? val.toLocaleString() 
      : val.toLocaleString(undefined, {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        });
    if (!includeUnit || !colUnit) return formattedNum;
    if (colPrefix && colPrefix === '₹') {
      const unitSuffix = colUnit !== '₹' ? ` ${colUnit.replace('₹/', '')}` : '';
      return `₹${formattedNum}${unitSuffix}`;
    }
    return `${formattedNum} ${colUnit}`;
  };

  // Copy value to clipboard
  const handleCopy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedMetric(label);
    setTimeout(() => setCopiedMetric(null), 2000);
  };

  // Format mode string display
  const formatModeDisplay = (statsRes: StatsResult) => {
    if (statsRes.hasNoMode) return 'No Mode (All values unique)';
    if (statsRes.modes.length === 0) return 'N/A';
    if (statsRes.modes.length === 1) {
      return `${fmt(statsRes.modes[0], true)} (freq: ${statsRes.modeFreq})`;
    }
    if (statsRes.modes.length <= 3) {
      return `${statsRes.modes.map(m => fmt(m, true)).join(', ')} (freq: ${statsRes.modeFreq})`;
    }
    return `${statsRes.modes.slice(0, 3).map(m => fmt(m, true)).join(', ')} +${statsRes.modes.length - 3} more (freq: ${statsRes.modeFreq})`;
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden font-sans transition-all ${className}`}>
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30 shadow-inner">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-extrabold tracking-tight text-white">{title}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-400" /> Automated Analysis
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">{subtitle}</p>
            </div>
          </div>

          {/* Action Buttons & Column Selector */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Column Selector Dropdown */}
            {detectedColumns.length > 0 && (
              <div className="relative inline-block min-w-[200px]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Select Numeric Column
                </label>
                <div className="relative">
                  <select
                    value={selectedColKey}
                    onChange={(e) => handleColumnChange(e.target.value)}
                    className="w-full appearance-none bg-slate-800/90 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 px-4 pr-10 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                  >
                    {detectedColumns.map(col => (
                      <option key={col.key} value={col.key} className="bg-slate-900 text-white">
                        📊 {col.label || col.key}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Expand / Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors self-end"
              title={isExpanded ? "Collapse Card" : "Expand Card"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

          </div>
        </div>

        {/* Selected Column Indicator Sub-bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">Current Column:</span>
            <span className="px-2.5 py-1 bg-indigo-900/50 text-indigo-200 font-bold rounded-lg border border-indigo-700/50">
              {selectedColLabel} ({selectedColKey})
            </span>
            {stats && (
              <span className="text-slate-400">
                • {stats.count} valid numerical observations
              </span>
            )}
          </div>

          {/* Controls: Precision & Variance Mode */}
          <div className="flex items-center space-x-4">
            
            {/* Decimal Precision Control */}
            <div className="flex items-center space-x-1.5 bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[11px] font-medium">Decimals:</span>
              {[0, 2, 4].map(p => (
                <button
                  key={p}
                  onClick={() => setPrecision(p)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    precision === p 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  .{p}
                </button>
              ))}
            </div>

            {/* Variance Formula Toggle */}
            <div className="flex items-center space-x-1.5 bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[11px] font-medium">Variance:</span>
              <button
                onClick={() => setIsSampleVariance(true)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  isSampleVariance 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Sample Variance (n-1 degrees of freedom)"
              >
                Sample (n-1)
              </button>
              <button
                onClick={() => setIsSampleVariance(false)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  !isSampleVariance 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Population Variance (n degrees of freedom)"
              >
                Pop (n)
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Body */}
      {isExpanded && (
        <div className="p-6 sm:p-8 space-y-8 bg-slate-50/50">
          
          {!stats ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
              <Info className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-slate-800">No Valid Numeric Data Found</h4>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                The selected column "{selectedColLabel}" does not contain valid numerical values. Please select another numeric column from the dropdown above.
              </p>
            </div>
          ) : (
            <>
              {/* Toast message if metric copied */}
              {copiedMetric && (
                <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center justify-between transition-all animate-bounce">
                  <span>Copied <strong>{copiedMetric}</strong> to clipboard!</span>
                  <Check className="w-4 h-4 ml-2" />
                </div>
              )}

              {/* ----------------- CORE REQ: 6 MAIN STATISTICAL METRICS GRID ----------------- */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600" /> Key Descriptive Statistics
                  </h4>
                  <span className="text-xs text-slate-400">Click any card to copy metric</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  
                  {/* 1. MEAN */}
                  <div 
                    onClick={() => handleCopy('Mean', fmt(stats.mean))}
                    className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 bg-blue-50 rounded-full group-hover:scale-110 transition-transform -z-0" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Mean (Average)</span>
                          <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 tracking-tight">
                          {fmt(stats.mean)}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Arithmetic Mean (x̄)</span>
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">Σx / N</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. MEDIAN */}
                  <div 
                    onClick={() => handleCopy('Median', fmt(stats.median))}
                    className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform -z-0" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Median (50th Percentile)</span>
                          <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 tracking-tight">
                          {fmt(stats.median)}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Middle Value</span>
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">Q2 (50%)</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. MODE */}
                  <div 
                    onClick={() => handleCopy('Mode', formatModeDisplay(stats))}
                    className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 bg-purple-50 rounded-full group-hover:scale-110 transition-transform -z-0" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Mode (Most Frequent)</span>
                          <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 tracking-tight line-clamp-2">
                          {formatModeDisplay(stats)}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>{stats.isMultimodal ? 'Multimodal' : stats.hasNoMode ? 'No Mode' : 'Unimodal'}</span>
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">Max Freq: {stats.modeFreq}</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. VARIANCE */}
                  <div 
                    onClick={() => handleCopy('Variance', fmt(stats.variance))}
                    className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 bg-amber-50 rounded-full group-hover:scale-110 transition-transform -z-0" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            4. Variance ({isSampleVariance ? 's² Sample' : 'σ² Population'})
                          </span>
                          <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 tracking-tight">
                          {fmt(stats.variance)}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Squared Spread</span>
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {isSampleVariance ? 'SS / (N-1)' : 'SS / N'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5. STANDARD DEVIATION */}
                  <div 
                    onClick={() => handleCopy('Standard Deviation', fmt(stats.stdDev))}
                    className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform -z-0" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            5. Standard Deviation ({isSampleVariance ? 's' : 'σ'})
                          </span>
                          <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 tracking-tight">
                          {fmt(stats.stdDev)}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Mean Deviation</span>
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">√Variance</span>
                      </div>
                    </div>
                  </div>

                  {/* 6. MIN & MAX (Boundaries) */}
                  <div 
                    onClick={() => handleCopy('Min/Max Range', `Min: ${fmt(stats.min)}, Max: ${fmt(stats.max)}`)}
                    className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 bg-rose-50 rounded-full group-hover:scale-110 transition-transform -z-0" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">6. Min / Max (Boundaries)</span>
                          <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="flex items-baseline space-x-3 text-slate-900">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Min</span>
                            <span className="text-2xl font-black">{fmt(stats.min)}</span>
                          </div>
                          <span className="text-slate-300 text-xl font-bold">/</span>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Max</span>
                            <span className="text-2xl font-black text-rose-600">{fmt(stats.max)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Total Range</span>
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">Δ = {fmt(stats.range)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* ----------------- VISUAL DISTRIBUTION HISTOGRAM CHART ----------------- */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-indigo-600" /> Empirical Data Binned Distribution (Histogram)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bins frequency across [{fmt(stats.min)} to {fmt(stats.max)}] with mean & median indicators
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="inline-flex items-center text-slate-600 font-semibold">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-1.5 inline-block" /> Mean ({fmt(stats.mean)})
                    </span>
                    <span className="inline-flex items-center text-slate-600 font-semibold">
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full mr-1.5 inline-block" /> Median ({fmt(stats.median)})
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                      Shape: <strong>{stats.skewType}</strong> ({fmt(stats.skewness)})
                    </span>
                  </div>
                </div>

                {/* Histogram Bars */}
                <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-200 relative">
                  
                  {stats.histogramBins.map((bin, idx) => {
                    const maxBinCount = Math.max(...stats.histogramBins.map(b => b.count), 1);
                    const barHeightPct = (bin.count / maxBinCount) * 100;
                    
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-10 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-xl z-20 whitespace-nowrap transition-opacity">
                          [{fmt(bin.binMin)} - {fmt(bin.binMax)}]: {bin.count} items ({bin.percentage.toFixed(1)}%)
                        </div>

                        {/* Bar Count label */}
                        <span className="text-[10px] font-bold text-slate-400 mb-1 group-hover:text-indigo-600 transition-colors">
                          {bin.count > 0 ? bin.count : ''}
                        </span>

                        {/* Bar rectangle */}
                        <div 
                          style={{ height: `${Math.max(barHeightPct, 4)}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            bin.count > 0 
                              ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-700 group-hover:to-indigo-500 shadow-xs' 
                              : 'bg-slate-100'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Axis Labels */}
                <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2 px-1">
                  <span>Min: {fmt(stats.min)}</span>
                  <span>Q1: {fmt(stats.q1)}</span>
                  <span>Median: {fmt(stats.median)}</span>
                  <span>Q3: {fmt(stats.q3)}</span>
                  <span>Max: {fmt(stats.max)}</span>
                </div>
              </div>

              {/* ----------------- SECONDARY EXTENDED METRICS TABLE ----------------- */}
              <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" /> Extended Summary Matrix
                  </h4>
                  <button 
                    onClick={() => {
                      const summaryTxt = `Summary Statistics for ${selectedColLabel}:\nMean: ${fmt(stats.mean)}\nMedian: ${fmt(stats.median)}\nMode: ${formatModeDisplay(stats)}\nVariance: ${fmt(stats.variance)}\nStd Dev: ${fmt(stats.stdDev)}\nMin: ${fmt(stats.min)}\nMax: ${fmt(stats.max)}\nCount: ${stats.count}\nSum: ${fmt(stats.sum)}`;
                      handleCopy('Full Matrix Summary', summaryTxt);
                    }}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Summary Text</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-4 p-4 hover:bg-slate-50 transition-colors">
                    <span className="font-semibold text-slate-500">Total Observations (N):</span>
                    <span className="font-bold text-slate-900">{stats.count}</span>
                    <span className="font-semibold text-slate-500">Cumulative Sum (Σx):</span>
                    <span className="font-bold text-slate-900">{fmt(stats.sum)}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 p-4 hover:bg-slate-50 transition-colors">
                    <span className="font-semibold text-slate-500">Sample Variance (s²):</span>
                    <span className="font-bold text-slate-900">{fmt(stats.sampleVariance)}</span>
                    <span className="font-semibold text-slate-500">Population Variance (σ²):</span>
                    <span className="font-bold text-slate-900">{fmt(stats.popVariance)}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 p-4 hover:bg-slate-50 transition-colors">
                    <span className="font-semibold text-slate-500">Sample Std Dev (s):</span>
                    <span className="font-bold text-slate-900">{fmt(stats.sampleStdDev)}</span>
                    <span className="font-semibold text-slate-500">Population Std Dev (σ):</span>
                    <span className="font-bold text-slate-900">{fmt(stats.popStdDev)}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 p-4 hover:bg-slate-50 transition-colors">
                    <span className="font-semibold text-slate-500">1st Quartile (Q1 25%):</span>
                    <span className="font-bold text-slate-900">{fmt(stats.q1)}</span>
                    <span className="font-semibold text-slate-500">3rd Quartile (Q3 75%):</span>
                    <span className="font-bold text-slate-900">{fmt(stats.q3)}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 p-4 hover:bg-slate-50 transition-colors">
                    <span className="font-semibold text-slate-500">Interquartile Range (IQR):</span>
                    <span className="font-bold text-slate-900">{fmt(stats.iqr)}</span>
                    <span className="font-semibold text-slate-500">Distribution Skewness:</span>
                    <span className="font-bold text-slate-900">{fmt(stats.skewness)} ({stats.skewType})</span>
                  </div>
                </div>
              </div>

            </>
          )}

        </div>
      )}
    </div>
  );
}

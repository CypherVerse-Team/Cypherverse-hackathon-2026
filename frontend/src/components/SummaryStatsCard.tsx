'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  ChevronDown, 
  Sparkles,
  Info,
  Layers,
  HelpCircle,
  Award,
  CheckCircle2,
  Sliders,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from 'lucide-react';

export interface ColumnSummaryOption {
  key: string;
  label?: string;
  unit?: string;
}

export interface SummaryStatsCardProps {
  data?: Record<string, any>[];
  numericArray?: number[];
  title?: string;
  subtitle?: string;
  defaultColumnKey?: string;
  columns?: ColumnSummaryOption[];
  className?: string;
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

  let median: number;
  const mid = Math.floor(count / 2);
  if (count % 2 === 1) {
    median = sorted[mid];
  } else {
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  }

  const freqMap: Record<number, number> = {};
  let maxFreq = 0;
  sorted.forEach(v => {
    freqMap[v] = (freqMap[v] || 0) + 1;
    if (freqMap[v] > maxFreq) maxFreq = freqMap[v];
  });

  const modes = Object.keys(freqMap)
    .filter(k => freqMap[Number(k)] === maxFreq && maxFreq > 1)
    .map(Number)
    .sort((a, b) => a - b);

  const hasNoMode = maxFreq <= 1 || (modes.length === count && count > 1);
  const isMultimodal = modes.length > 1 && !hasNoMode;

  const sumSquaredDiffs = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const popVariance = sumSquaredDiffs / count;
  const sampleVariance = count > 1 ? sumSquaredDiffs / (count - 1) : 0;
  const variance = isSampleVariance ? sampleVariance : popVariance;

  const popStdDev = Math.sqrt(popVariance);
  const sampleStdDev = Math.sqrt(sampleVariance);
  const stdDev = isSampleVariance ? sampleStdDev : popStdDev;

  const getPercentile = (p: number): number => {
    if (count === 1) return sorted[0];
    const index = (count - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const q1 = getPercentile(0.25);
  const q3 = getPercentile(0.75);
  const iqr = q3 - q1;

  let skewness = 0;
  if (count > 2 && sampleStdDev > 0) {
    const sumCubed = sorted.reduce((acc, v) => acc + Math.pow((v - mean) / sampleStdDev, 3), 0);
    skewness = (count / ((count - 1) * (count - 2))) * sumCubed;
  }
  let skewType: 'Symmetric' | 'Right-skewed' | 'Left-skewed' = 'Symmetric';
  if (skewness > 0.5) skewType = 'Right-skewed';
  else if (skewness < -0.5) skewType = 'Left-skewed';

  const numBins = Math.min(6, Math.max(3, Math.round(Math.sqrt(count))));
  const binWidth = range > 0 ? range / numBins : 1;
  const bins: { binMin: number; binMax: number; count: number; percentage: number }[] = [];

  for (let i = 0; i < numBins; i++) {
    const bMin = min + i * binWidth;
    const bMax = i === numBins - 1 ? max : min + (i + 1) * binWidth;
    bins.push({ binMin: bMin, binMax: bMax, count: 0, percentage: 0 });
  }

  sorted.forEach(v => {
    for (let i = 0; i < bins.length; i++) {
      if (i === bins.length - 1) {
        if (v >= bins[i].binMin && v <= bins[i].binMax) {
          bins[i].count++;
          break;
        }
      } else {
        if (v >= bins[i].binMin && v < bins[i].binMax) {
          bins[i].count++;
          break;
        }
      }
    }
  });

  bins.forEach(b => {
    b.percentage = count > 0 ? (b.count / count) * 100 : 0;
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

const SHRAMSETU_COLUMN_META: Record<string, { label: string; unit: string; prefix?: string; tip: string }> = {
  amount: { label: 'Booking Payout Amount', unit: '₹', prefix: '₹', tip: 'Total agreed transaction price per job' },
  hourly_rate: { label: 'Hourly Labour Wage', unit: '₹/hr', prefix: '₹', tip: 'Hourly rate charged by skilled worker' },
  service_fee: { label: 'Platform Protection Fee', unit: '₹', prefix: '₹', tip: 'Platform escrow & dispute insurance fee' },
  worker_rating: { label: 'Customer Satisfaction Score', unit: '★', tip: 'Worker average customer feedback out of 5 stars' },
  experience_years: { label: 'Trade Experience', unit: 'Years', tip: 'Years of professional field work' },
  jobs_completed: { label: 'Completed Jobs Count', unit: 'Jobs', tip: 'Total verified jobs successfully delivered' },
  distance_km: { label: 'Dispatch Distance', unit: 'km', tip: 'Distance between worker and site' },
  duration_hours: { label: 'Job Duration', unit: 'Hours', tip: 'Total active work hours spent on site' },
  hourly_budget: { label: 'Contractor Team Budget', unit: '₹/hr', prefix: '₹', tip: 'Hourly rate for complete crew' },
  safety_score: { label: 'Safety & Quality Score', unit: '%', tip: 'Compliance and job safety adherence score' },
  members_count: { label: 'Crew Team Size', unit: 'Workers', tip: 'Number of active tradespeople in crew' },
  verification_score: { label: 'KYC Trust Index', unit: '/100', tip: 'Document and skill background score' },
};

export default function SummaryStatsCard({
  data,
  numericArray,
  title = "Business Analytics & Summary Insights",
  subtitle = "Key performance indicators, typical pricing benchmarks, and predictability metrics",
  defaultColumnKey,
  columns,
  className = '',
  onColumnSelect
}: SummaryStatsCardProps) {
  const [viewMode, setViewMode] = useState<'plain' | 'technical'>('plain');
  const [isExpanded, setIsExpanded] = useState(true);
  const [precision, setPrecision] = useState<number>(1);
  const [copiedMetric, setCopiedMetric] = useState<string | null>(null);

  const detectedColumns = useMemo<ColumnSummaryOption[]>(() => {
    if (columns && columns.length > 0) return columns;
    if (!data || data.length === 0) return [];
    
    const sampleRow = data[0];
    const keys: ColumnSummaryOption[] = [];
    Object.keys(sampleRow).forEach(key => {
      const val = sampleRow[key];
      const isNum = typeof val === 'number' || (!isNaN(Number(val)) && val !== '' && val !== null && typeof val !== 'boolean');
      if (isNum && !key.toLowerCase().includes('id') && key !== 'index') {
        const meta = SHRAMSETU_COLUMN_META[key];
        keys.push({
          key,
          label: meta?.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          unit: meta?.unit || ''
        });
      }
    });
    return keys;
  }, [data, columns]);

  const [selectedColKey, setSelectedColKey] = useState<string>(
    defaultColumnKey || (detectedColumns.length > 0 ? detectedColumns[0].key : 'amount')
  );

  const extractedNumbers = useMemo(() => {
    if (numericArray && numericArray.length > 0) return numericArray;
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

  const stats = useMemo(() => {
    return calculateSummaryStats(extractedNumbers, true);
  }, [extractedNumbers]);

  const handleColumnChange = (key: string) => {
    setSelectedColKey(key);
    if (onColumnSelect) onColumnSelect(key);
  };

  const selectedColObj = detectedColumns.find(c => c.key === selectedColKey);
  const domainMeta = SHRAMSETU_COLUMN_META[selectedColKey];
  const selectedColLabel = domainMeta?.label || selectedColObj?.label || selectedColKey;
  const colUnit = domainMeta?.unit || selectedColObj?.unit || '';
  const colPrefix = domainMeta?.prefix || '';

  const fmt = (val: number | undefined | null, includeUnit: boolean = true): string => {
    if (val === undefined || val === null || isNaN(val)) return '—';
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

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedMetric(label);
    setTimeout(() => setCopiedMetric(null), 2000);
  };

  // Predictability / Variation score
  const getVariationInsight = (statsRes: StatsResult) => {
    if (!statsRes || statsRes.mean === 0) return { label: 'Stable', color: 'text-green-600 bg-green-50 border-green-200', desc: 'Consistent pricing across records' };
    const cv = (statsRes.stdDev / statsRes.mean) * 100;
    if (cv < 25) {
      return { label: 'High Consistency', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'Prices are very steady and predictable.' };
    } else if (cv < 60) {
      return { label: 'Moderate Range', color: 'text-blue-700 bg-blue-50 border-blue-200', desc: 'Normal variation based on worker seniority or project scope.' };
    } else {
      return { label: 'Wide Spread', color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'Covers small quick tasks up to major high-end contracts.' };
    }
  };

  const varInsight = stats ? getVariationInsight(stats) : null;

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden font-sans ${className}`}>
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Sparkles className="w-3 h-3 mr-1 text-blue-400" /> Human-Friendly Insights
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">{subtitle}</p>
            </div>
          </div>

          {/* Action Buttons & Column Selector */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* View Mode Toggle */}
            <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700 flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode('plain')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'plain' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Simple Overview
              </button>
              <button
                onClick={() => setViewMode('technical')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'technical' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Detailed Math
              </button>
            </div>

            {/* Column Selector Dropdown */}
            {detectedColumns.length > 0 && (
              <div className="relative inline-block min-w-[190px]">
                <div className="relative">
                  <select
                    value={selectedColKey}
                    onChange={(e) => handleColumnChange(e.target.value)}
                    className="w-full appearance-none bg-slate-800 text-white text-xs font-bold py-2.5 px-3.5 pr-8 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
              title={isExpanded ? "Collapse Card" : "Expand Card"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

          </div>
        </div>

        {/* Selected Column Sub-bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Analyzing:</span>
            <span className="px-2.5 py-0.5 bg-blue-900/60 text-blue-200 font-bold rounded-lg border border-blue-700/50">
              {selectedColLabel}
            </span>
            {stats && (
              <span className="text-slate-400">• {stats.count} total records</span>
            )}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            {domainMeta?.tip || 'Statistically calculated across verified database records'}
          </div>
        </div>
      </div>

      {/* Main Body */}
      {isExpanded && (
        <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
          
          {!stats ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
              <Info className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-800">No Numeric Records Found</h4>
              <p className="text-xs text-slate-500 mt-1">
                Please choose another category or column from the dropdown above.
              </p>
            </div>
          ) : (
            <>
              {/* Copied notification */}
              {copiedMetric && (
                <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md flex items-center justify-between">
                  <span>Copied <strong>{copiedMetric}</strong> to clipboard!</span>
                  <Check className="w-4 h-4 ml-2" />
                </div>
              )}

              {/* ----------------- 1. PLAIN LANGUAGE EXECUTIVE INSIGHTS ----------------- */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      💡
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Plain-English Summary</h4>
                      <p className="text-[11px] text-slate-500">What these numbers mean in simple everyday terms</p>
                    </div>
                  </div>
                  {varInsight && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${varInsight.color}`}>
                      {varInsight.label}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100/80 space-y-1">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Target size={14} className="text-blue-600" />
                      Typical / Average Value
                    </div>
                    <div className="text-lg font-black text-blue-950">{fmt(stats.mean)}</div>
                    <p className="text-[11px] text-blue-800/80">
                      The average {selectedColLabel.toLowerCase()} across all jobs.
                    </p>
                  </div>

                  <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100/80 space-y-1">
                    <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-indigo-600" />
                      Typical Middle 50% Range
                    </div>
                    <div className="text-lg font-black text-indigo-950">{fmt(stats.q1)} – {fmt(stats.q3)}</div>
                    <p className="text-[11px] text-indigo-800/80">
                      Half of all jobs naturally fall between these two numbers.
                    </p>
                  </div>

                  <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100/80 space-y-1">
                    <div className="font-bold text-purple-900 flex items-center gap-1.5">
                      <Award size={14} className="text-purple-600" />
                      Lowest to Highest Gap
                    </div>
                    <div className="text-lg font-black text-purple-950">{fmt(stats.min)} to {fmt(stats.max)}</div>
                    <p className="text-[11px] text-purple-800/80">
                      Total spread of {fmt(stats.range)} between minimum and maximum.
                    </p>
                  </div>
                </div>
              </div>

              {/* ----------------- 2. MAIN METRIC CARDS ----------------- */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Core Metrics
                  </h4>
                  <span className="text-[11px] text-slate-400">Click any card to copy</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: Average */}
                  <div 
                    onClick={() => handleCopy('Average', fmt(stats.mean))}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                      <span>Average</span>
                      <Copy size={13} className="text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{fmt(stats.mean)}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Sum divided by total records</div>
                  </div>

                  {/* Card 2: Middle / Median */}
                  <div 
                    onClick={() => handleCopy('Median', fmt(stats.median))}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                      <span>Middle Value (Median)</span>
                      <Copy size={13} className="text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{fmt(stats.median)}</div>
                    <div className="text-[11px] text-slate-500 mt-1">50% are below and 50% above</div>
                  </div>

                  {/* Card 3: Most Common (Mode) */}
                  <div 
                    onClick={() => handleCopy('Most Common', stats.modes.length > 0 ? fmt(stats.modes[0]) : 'None')}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                      <span>Most Common Value</span>
                      <Copy size={13} className="text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <div className="text-xl font-black text-slate-900 truncate">
                      {stats.hasNoMode ? 'All Unique' : stats.modes.map(m => fmt(m)).join(', ')}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {stats.hasNoMode ? 'No single repeated value' : `Repeated ${stats.modeFreq} times`}
                    </div>
                  </div>

                  {/* Card 4: Spread / Variation */}
                  <div 
                    onClick={() => handleCopy('Variation Spread', fmt(stats.stdDev))}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                      <span>Standard Variation (±)</span>
                      <Copy size={13} className="text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">±{fmt(stats.stdDev)}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Typical distance from average</div>
                  </div>

                </div>
              </div>

              {/* ----------------- 3. DETAILED MATH VIEW (OPTIONAL EXPANDABLE) ----------------- */}
              {viewMode === 'technical' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Calculator size={14} className="text-indigo-600" /> Formal Statistical Equations & Dispersion
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">Precision: .{precision}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-medium">Sample Variance (s²)</div>
                      <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{fmt(stats.sampleVariance, false)}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">Σ(x - x̄)² / (n - 1)</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-medium">Std Deviation (s)</div>
                      <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{fmt(stats.sampleStdDev, false)}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">√Sample Variance</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-medium">Interquartile Range (IQR)</div>
                      <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{fmt(stats.iqr)}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">Q3 (75%) - Q1 (25%)</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-medium">Skewness Coefficient</div>
                      <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                        {stats.skewness.toFixed(2)} ({stats.skewType})
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">Fisher-Pearson g₁</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- 4. VISUAL DISTRIBUTION BARS ----------------- */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Distribution Range Breakdown
                  </h4>
                  <span className="text-xs text-slate-400">Total {stats.count} records</span>
                </div>

                <div className="space-y-2.5">
                  {stats.histogramBins.map((bin, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{fmt(bin.binMin)} – {fmt(bin.binMax)}</span>
                        <span className="text-slate-500 font-mono">{bin.count} records ({bin.percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.max(5, bin.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          )}

        </div>
      )}

    </div>
  );
}

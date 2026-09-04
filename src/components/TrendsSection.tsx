import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  TrendingUp,
  Activity,
  Wind,
  Thermometer,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  Info,
  Layers,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  Compass,
  Eye,
  Sliders
} from 'lucide-react';
import {
  HourlyTrendPoint,
  UserProfile,
  EnvironmentalData,
  HealthRiskAssessment
} from '../types';

interface TrendsSectionProps {
  trends: HourlyTrendPoint[];
  userProfile: UserProfile;
  currentCity: EnvironmentalData;
  assessment: HealthRiskAssessment;
  isCelsius: boolean;
  onScrollToTop: () => void;
  onNavigateToProfile: () => void;
}

export const TrendsSection: React.FC<TrendsSectionProps> = ({
  trends,
  userProfile,
  currentCity,
  assessment,
  isCelsius,
  onScrollToTop,
  onNavigateToProfile,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [entryPhase, setEntryPhase] = useState<number>(0);

  const [activeMetric, setActiveMetric] = useState<'aqi' | 'temp' | 'risk'>('aqi');
  // Default selected index: index 4 is typically 12:00 (NOW)
  const [selectedIndex, setSelectedIndex] = useState<number>(4);
  const [chartRenderKey, setChartRenderKey] = useState<number>(0);

  // IntersectionObserver for Section Entry
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
      setHasEntered(true);
    }

    return () => observer.disconnect();
  }, []);

  // Cinematic Entry Timeline
  useEffect(() => {
    if (!hasEntered) return;
    setEntryPhase(0);
    const t1 = setTimeout(() => setEntryPhase(1), 400);
    const t2 = setTimeout(() => setEntryPhase(2), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [hasEntered]);

  // Whenever metric changes, trigger chart re-draw animation
  const handleMetricChange = (metric: 'aqi' | 'temp' | 'risk') => {
    setActiveMetric(metric);
    setChartRenderKey((prev) => prev + 1);
  };

  const formatTemp = (celsius: number) => {
    return isCelsius
      ? `${celsius}°C`
      : `${Math.round((celsius * 9) / 5 + 32)}°F`;
  };

  // Metric configs
  const metricConfigs = {
    aqi: {
      id: 'aqi' as const,
      label: 'AQI Curve',
      fullName: 'Air Quality (AQI)',
      unit: 'AQI',
      color: '#63D9B3',
      glowColor: 'rgba(99, 217, 179, 0.25)',
      gradientId: 'aqiTrendGradient',
      min: 0,
      max: Math.max(150, Math.max(...trends.map((t) => t.aqi)) + 20),
      thresholdLabel: 'Moderate Air Quality Boundary (50 AQI)',
      thresholdVal: 50,
      description: 'Projected particulate & photochemical ground ozone evolution over 24 hours.',
      personalityBadge: 'ATMOSPHERIC PARTICULATE DISPERSION',
      icon: Wind
    },
    temp: {
      id: 'temp' as const,
      label: 'Temperature',
      fullName: 'Ambient Thermal Curve',
      unit: isCelsius ? '°C' : '°F',
      color: '#f97316', // orange
      glowColor: 'rgba(249, 115, 22, 0.25)',
      gradientId: 'tempTrendGradient',
      min: Math.min(10, Math.min(...trends.map((t) => t.temp)) - 5),
      max: Math.max(38, Math.max(...trends.map((t) => t.temp)) + 5),
      thresholdLabel: 'Elevated Thermal Stress (30°C)',
      thresholdVal: 30,
      description: 'Diurnal solar radiation heating curve expanding the atmospheric boundary layer.',
      personalityBadge: 'THERMAL FLUX & SOLAR INSOLATION',
      icon: Thermometer
    },
    risk: {
      id: 'risk' as const,
      label: 'Health Risk',
      fullName: 'Personalized Bio-Risk Score',
      unit: '/ 100',
      color: '#f43f5e', // rose
      glowColor: 'rgba(244, 63, 94, 0.25)',
      gradientId: 'riskTrendGradient',
      min: 0,
      max: 100,
      thresholdLabel: 'Guarded Bio-Sensitivity Threshold (50+)',
      thresholdVal: 50,
      description: 'Synthesized physiological stress index calculated specifically for your bio-profile.',
      personalityBadge: 'SYNTHESIZED VULNERABILITY TRAJECTORY',
      icon: Activity
    }
  };

  const currentConfig = metricConfigs[activeMetric];

  // SVG Chart Dimensions
  const chartWidth = 840;
  const chartHeight = 280;
  const paddingX = 48;
  const paddingY = 36;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  // Helper to extract value
  const getPointValue = (p: HourlyTrendPoint) => {
    if (activeMetric === 'aqi') return p.aqi;
    if (activeMetric === 'temp') return p.temp;
    return p.riskScore;
  };

  const minVal = currentConfig.min;
  const maxVal = currentConfig.max;

  // Identify Peak / Exposure Spike point in trends
  const spikeInfo = useMemo(() => {
    let maxMetricVal = -Infinity;
    let maxIdx = -1;
    trends.forEach((pt, idx) => {
      const val = getPointValue(pt);
      if (val > maxMetricVal) {
        maxMetricVal = val;
        maxIdx = idx;
      }
    });

    const isElevated =
      (activeMetric === 'aqi' && maxMetricVal >= 60) ||
      (activeMetric === 'temp' && maxMetricVal >= 28) ||
      (activeMetric === 'risk' && maxMetricVal >= 45);

    return {
      peakIndex: maxIdx,
      peakPoint: trends[maxIdx],
      peakValue: maxMetricVal,
      isElevated
    };
  }, [trends, activeMetric]);

  // Generate SVG Coordinates
  const points = useMemo(() => {
    return trends.map((p, idx) => {
      const val = getPointValue(p);
      const x = paddingX + (idx / Math.max(1, trends.length - 1)) * usableWidth;
      const normalizedY = Math.min(1, Math.max(0, (val - minVal) / (maxVal - minVal)));
      const y = chartHeight - paddingY - normalizedY * usableHeight;
      const isPast = idx < 4;
      const isNow = idx === 4;
      const isFuture = idx > 4;
      return { x, y, val, point: p, idx, isPast, isNow, isFuture };
    });
  }, [trends, activeMetric, minVal, maxVal]);

  // Create smooth SVG cubic bezier path
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  // Past segment vs future segment paths for visual distinction
  const pastPoints = points.filter((p) => p.idx <= 4);
  const futurePoints = points.filter((p) => p.idx >= 4);
  const pastLinePath = createSmoothPath(pastPoints);
  const futureLinePath = createSmoothPath(futurePoints);

  // Threshold Y coordinate
  const thresholdNormalized = Math.min(1, Math.max(0, (currentConfig.thresholdVal - minVal) / (maxVal - minVal)));
  const thresholdY = chartHeight - paddingY - thresholdNormalized * usableHeight;

  // Selected point object
  const activeSelected = points[selectedIndex] || points[4];
  const isSpikeSelected = activeSelected.idx === spikeInfo.peakIndex && spikeInfo.isElevated;

  return (
    <section
      ref={sectionRef}
      id="trends"
      className="relative min-h-screen w-full flex flex-col justify-center px-4 sm:px-8 py-24 earth-section text-zinc-100 overflow-hidden"
    >
      {/* Dynamic Background Atmosphere reacting to Active Metric */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] rounded-full blur-[170px] transition-all duration-700 pointer-events-none opacity-40 ${
            activeMetric === 'temp' ? 'animate-trends-thermal' : ''
          }`}
          style={{ background: currentConfig.glowColor }}
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 quiet-grid" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* ============================================================ */}
        {/* 1. CINEMATIC SECTION ENTRY HEADER */}
        {/* ============================================================ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            {/* Reveal 1: FORECAST ENGINE ACTIVE */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151326]/80 border border-white/10 text-xs font-mono uppercase tracking-wider mb-3 transition-all duration-500 shadow-sm ${
                entryPhase >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#FF5C4D] animate-pulse" />
              <span className="text-[#FF5C4D] font-semibold">FORECAST ENGINE ACTIVE // PROTOCOL 07</span>
            </div>

            {/* Reveal 2: 24-Hour Environmental Trends */}
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl text-white font-light tracking-tight flex items-center gap-3 flex-wrap transition-all duration-700 ${
                entryPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span>24-Hour Environmental Trends</span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 uppercase tracking-wider font-medium">
                {currentConfig.personalityBadge}
              </span>
            </h2>

            <p
              className={`text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl font-light transition-all duration-700 ${
                entryPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Explore how atmospheric particulate loads, thermal flux, and your individual bio-vulnerability change across past observations and projected hours.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg backdrop-blur-xl shrink-0">
            {[
              { id: 'aqi' as const, label: 'AQI Curve', icon: Wind },
              { id: 'temp' as const, label: 'Temperature', icon: Thermometer },
              { id: 'risk' as const, label: 'Health Risk', icon: Activity }
            ].map((tab) => {
              const isSelected = activeMetric === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`trends-tab-${tab.id}`}
                  onClick={() => handleMetricChange(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800 text-white shadow-md border border-zinc-700 ring-1 ring-white/10'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                  style={{
                    borderColor: isSelected ? currentConfig.color : undefined
                  }}
                >
                  <TabIcon
                    className="w-3.5 h-3.5"
                    style={{ color: isSelected ? currentConfig.color : undefined }}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2 & 8. INTERACTIVE TIME EXPLORER BAR (Past vs Now vs Projected) */}
        {/* ============================================================ */}
        <div className="mb-6 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Timeline Directional Heading */}
            <div className="flex items-center gap-3 text-xs font-mono tracking-wider text-zinc-400 shrink-0">
              <Clock className="w-4 h-4 text-[#8EDCFF]" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-zinc-500">← PAST 24 HOURS</span>
                <span className="text-zinc-600 font-bold">•</span>
                <span className="text-[#63D9B3] font-bold bg-[#63D9B3]/10 px-2 py-0.5 rounded border border-[#63D9B3]/20">
                  NOW ({trends[4]?.time || '12:00'})
                </span>
                <span className="text-zinc-600 font-bold">•</span>
                <span className="text-sky-400">NEXT 24 HOURS (PROJECTED) →</span>
                {currentCity.isRealTelemetry && (
                  <span className="text-[10px] font-mono text-[#63D9B3]/90 bg-[#63D9B3]/10 px-2 py-0.5 rounded border border-[#63D9B3]/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#63D9B3] animate-pulse" />
                    LIVE SYNC
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Time Nodes Scrubber */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto py-1 justify-start lg:justify-end">
              {trends.map((pt, idx) => {
                const isSelected = selectedIndex === idx;
                const isNow = idx === 4;
                const isFuture = idx > 4;

                return (
                  <button
                    key={pt.time}
                    id={`time-scrubber-node-${idx}`}
                    onClick={() => setSelectedIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)] border-white scale-105'
                        : isNow
                        ? 'bg-[#151326] text-[#63D9B3] border-[#63D9B3]/50 hover:bg-zinc-800'
                        : isFuture
                        ? 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                        : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300'
                    }`}
                  >
                    {isNow && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#63D9B3] animate-pulse" />
                    )}
                    <span>{pt.time}</span>
                    {isNow && (
                      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">NOW</span>
                    )}
                    {isFuture && !isSelected && (
                      <span className="text-[9px] text-sky-400 opacity-60">PROJ</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Status & Projection Notice */}
          <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-zinc-500 gap-2">
            <span className="flex items-center gap-1.5">
              <Info className="w-3 h-3 text-zinc-500 shrink-0" />
              <span>Current hour reflects live observed telemetry. Future hours represent atmospheric numerical forecast projections.</span>
            </span>
            <span className="text-zinc-600">MODEL: OPEN-METEO ATMOSPHERIC ENSEMBLE</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3 & 4. THE LIVING GRAPH & THE TIME SCANNER */}
        {/* ============================================================ */}
        <div
          id="trends-chart-card"
          className="bg-zinc-900/50 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-zinc-800 mb-8 relative overflow-hidden transition-all duration-500 shadow-2xl"
          style={{
            borderColor: `${currentConfig.color}40`
          }}
        >
          {/* Chart Header Info & Time Scanner HUD Pill */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-mono uppercase tracking-wider font-bold"
                  style={{ color: currentConfig.color }}
                >
                  {currentConfig.fullName}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs font-mono text-zinc-400">
                  {activeSelected.isFuture ? 'PROJECTED FORECAST MODEL' : activeSelected.isNow ? 'ACTIVE REAL-TIME SENSOR' : 'HISTORICAL RECORDING'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-light text-white">
                {currentConfig.label} Trajectory
              </h3>
              <p className="text-xs text-zinc-400 font-light mt-1 max-w-xl">
                {currentConfig.description}
              </p>
            </div>

            {/* HUD Scanner Readout Pill for Selected Point */}
            <div
              className="bg-zinc-950/95 px-5 py-3 rounded-2xl border border-zinc-800 flex items-center gap-4 shadow-xl transition-all duration-300"
              style={{
                borderColor: `${currentConfig.color}60`
              }}
            >
              <div
                className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0"
                style={{ color: currentConfig.color }}
              >
                <currentConfig.icon className="w-5 h-5 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    TIME: <strong className="text-white">{activeSelected.point.time}</strong>
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    {activeSelected.isFuture ? 'Estimated' : activeSelected.isNow ? 'Active' : 'Observed'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2.5">
                  <span className="text-xl font-mono font-bold text-white">
                    {activeMetric === 'temp'
                      ? formatTemp(activeSelected.point.temp)
                      : activeMetric === 'aqi'
                      ? `AQI ${activeSelected.point.aqi}`
                      : `Risk ${activeSelected.point.riskScore} / 100`}
                  </span>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      activeSelected.point.riskLevel === 'low'
                        ? 'bg-[#63D9B3]/15 text-[#63D9B3] border border-[#63D9B3]/30'
                        : activeSelected.point.riskLevel === 'moderate'
                        ? 'bg-[#F6B73C]/15 text-[#F6B73C] border border-[#F6B73C]/30'
                        : activeSelected.point.riskLevel === 'high'
                        ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                        : 'bg-[#FF5C4D]/15 text-[#FF5C4D] border border-[#FF5C4D]/30'
                    }`}
                  >
                    STATUS: {activeSelected.point.riskLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

            {/* Responsive Interactive SVG Canvas */}
            <div className="w-full overflow-x-auto select-none">
              <div className="min-w-[700px]">
                <svg
                  key={chartRenderKey}
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto overflow-visible select-none"
                >
                <defs>
                  {/* Metric Area Fill Gradient */}
                  <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentConfig.color} stopOpacity="0.28" />
                    <stop offset="60%" stopColor={currentConfig.color} stopOpacity="0.06" />
                    <stop offset="100%" stopColor={currentConfig.color} stopOpacity="0.0" />
                  </linearGradient>

                  {/* Scanner Glow Filter */}
                  <filter id="scannerLaser" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Background Grid Lines with subtle coordinates */}
                {[0.2, 0.4, 0.6, 0.8].map((factor, i) => {
                  const yPos = paddingY + factor * usableHeight;
                  const labelVal = Math.round(maxVal - factor * (maxVal - minVal));
                  return (
                    <g key={i}>
                      <line
                        x1={paddingX}
                        y1={yPos}
                        x2={chartWidth - paddingX}
                        y2={yPos}
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeDasharray="4 6"
                      />
                      <text
                        x={paddingX - 10}
                        y={yPos + 4}
                        fill="rgba(255, 255, 255, 0.25)"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {activeMetric === 'temp' ? `${labelVal}°` : labelVal}
                      </text>
                    </g>
                  );
                })}

                {/* Threshold Guideline */}
                <line
                  x1={paddingX}
                  y1={thresholdY}
                  x2={chartWidth - paddingX}
                  y2={thresholdY}
                  stroke="rgba(244, 63, 94, 0.4)"
                  strokeDasharray="6 4"
                  strokeWidth="1.5"
                />
                <text
                  x={chartWidth - paddingX - 4}
                  y={thresholdY - 6}
                  fill="rgba(244, 63, 94, 0.8)"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                  fontWeight="600"
                >
                  {currentConfig.thresholdLabel}
                </text>

                {/* Distinguishing Vertical Line at NOW (Index 4) */}
                {points[4] && (
                  <g>
                    <line
                      x1={points[4].x}
                      y1={paddingY - 10}
                      x2={points[4].x}
                      y2={chartHeight - paddingY}
                      stroke="rgba(52, 211, 153, 0.35)"
                      strokeDasharray="3 3"
                      strokeWidth="1.5"
                    />
                    <text
                      x={points[4].x}
                      y={paddingY - 14}
                      fill="#63D9B3"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      CURRENT NOW
                    </text>
                  </g>
                )}

                {/* Area Gradient Fill */}
                <path d={areaPath} fill={`url(#${currentConfig.gradientId})`} />

                {/* Past Continuous Curve */}
                <path
                  d={pastLinePath}
                  fill="transparent"
                  stroke={currentConfig.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-trends-draw"
                />

                {/* Future Forecast Segment (Dashed to signify projection) */}
                <path
                  d={futureLinePath}
                  fill="transparent"
                  stroke={currentConfig.color}
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  className="animate-trends-draw"
                />

                {/* ============================================================ */}
                {/* 4. THE TIME SCANNER: VERTICAL SCANNER LASER AT SELECTED POINT */}
                {/* ============================================================ */}
                <g>
                  {/* Glowing Laser Beam */}
                  <line
                    x1={activeSelected.x}
                    y1={paddingY - 8}
                    x2={activeSelected.x}
                    y2={chartHeight - paddingY}
                    stroke={currentConfig.color}
                    strokeWidth="2"
                    filter="url(#scannerLaser)"
                    className="animate-trends-scanner transition-all duration-300"
                  />

                  {/* Bottom track indicator pip */}
                  <circle
                    cx={activeSelected.x}
                    cy={chartHeight - paddingY}
                    r="4"
                    fill={currentConfig.color}
                  />

                  {/* Radar pulse around selected point */}
                  <circle
                    cx={activeSelected.x}
                    cy={activeSelected.y}
                    r="12"
                    fill={currentConfig.color}
                    fillOpacity="0.3"
                    className="animate-trends-ping"
                  />
                </g>

                {/* ============================================================ */}
                {/* 5. ENVIRONMENTAL EVENT DETECTION: PEAK SPIKE MARKER */}
                {/* ============================================================ */}
                {spikeInfo.isElevated && points[spikeInfo.peakIndex] && (
                  <g
                    className="cursor-pointer"
                    onClick={() => setSelectedIndex(spikeInfo.peakIndex)}
                  >
                    {/* Spike Callout Banner */}
                    <rect
                      x={points[spikeInfo.peakIndex].x - 65}
                      y={points[spikeInfo.peakIndex].y - 32}
                      width="130"
                      height="20"
                      rx="6"
                      fill="#050505"
                      stroke="#f59e0b"
                      strokeWidth="1.2"
                    />
                    <text
                      x={points[spikeInfo.peakIndex].x}
                      y={points[spikeInfo.peakIndex].y - 18}
                      fill="#fbbf24"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      ⚠ EXPOSURE SPIKE
                    </text>

                    {/* Beacon Ring */}
                    <circle
                      cx={points[spikeInfo.peakIndex].x}
                      cy={points[spikeInfo.peakIndex].y}
                      r="9"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      className="animate-pulse"
                    />
                  </g>
                )}

                {/* Interactive Points on the Curve */}
                {points.map((pt, idx) => {
                  const isSelected = selectedIndex === idx;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer group"
                      onClick={() => setSelectedIndex(idx)}
                    >
                      {/* Generous touch target */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="20"
                        fill="transparent"
                      />

                      {/* Point Outer Ring */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? 6 : 4}
                        fill={isSelected ? '#ffffff' : currentConfig.color}
                        stroke="#050505"
                        strokeWidth="2.5"
                        className="transition-all duration-300"
                      />

                      {/* Time Label on X-Axis */}
                      <text
                        x={pt.x}
                        y={chartHeight - 10}
                        fill={isSelected ? '#ffffff' : pt.isNow ? '#63D9B3' : '#71717a'}
                        fontSize="11"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight={isSelected || pt.isNow ? 'bold' : 'normal'}
                      >
                        {pt.point.time}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Chart Interaction Footer Guide */}
          <div className="pt-4 mt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-2 font-mono">
              <Info className="w-3.5 h-3.5 text-[#8EDCFF]" />
              <span>Click or tap any time node to steer the time scanner and inspect atmospheric layers</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#63D9B3]" /> Past Observation
              </span>
              <span className="flex items-center gap-1.5 text-white font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" /> Active Scanner
              </span>
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-2.5 h-[2px] bg-sky-400" /> Projected Forecast
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5 & 6. EXPOSURE EVENT CALLOUT & PERSONALIZED IMPACT TRAJECTORY */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Card 1: Selected Moment Environmental Breakdown */}
          <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8EDCFF] font-semibold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                ENVIRONMENT AT {activeSelected.point.time}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                {activeSelected.isFuture ? 'Projected' : activeSelected.isNow ? 'Real-Time' : 'Historical'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1 font-mono text-center">
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Air Quality</span>
                <span className="text-[#63D9B3] font-bold text-sm">AQI {activeSelected.point.aqi}</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Ambient Temp</span>
                <span className="text-orange-300 font-bold text-sm">{formatTemp(activeSelected.point.temp)}</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">UV Index</span>
                <span className="text-amber-300 font-bold text-sm">{activeSelected.point.uv}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Relative humidity estimated at {activeSelected.point.humidity}%. Ambient air boundary layer behaves in accordance with diurnal solar absorption.
            </p>
          </div>

          {/* Card 2: Exposure Spike Event Detection (Requirement 5) */}
          <div
            className={`p-6 rounded-2xl border space-y-3 relative overflow-hidden transition-all duration-300 ${
              isSpikeSelected
                ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                : 'bg-zinc-900/60 border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                ENVIRONMENTAL EVENT DETECTION
              </span>
              {spikeInfo.isElevated && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PEAK AT {spikeInfo.peakPoint.time}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-light text-white">
                {spikeInfo.isElevated ? `Exposure Spike at ${spikeInfo.peakPoint.time}` : 'Stable Atmospheric Continuum'}
              </span>
            </div>

            <p className="text-xs text-zinc-300 font-light leading-relaxed">
              {spikeInfo.isElevated
                ? `Environmental conditions temporarily peaked around ${spikeInfo.peakPoint.time} (AQI ${spikeInfo.peakPoint.aqi}, ${formatTemp(spikeInfo.peakPoint.temp)}). Driven by midday photochemical ozone formation and heated thermal suspension.`
                : 'No acute atmospheric particulate spikes detected across this diurnal cycle.'}
            </p>
          </div>

          {/* Card 3: Personalized Impact Trajectory (Requirement 6) */}
          <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                PERSONALIZED IMPACT TRAJECTORY
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 capitalize">
                {userProfile.healthCondition.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-2xl font-light text-white">
                {activeSelected.point.riskScore}
              </span>
              <span className="text-xs text-zinc-500">/ 100 Guidance Level</span>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              {activeSelected.point.riskScore >= 60
                ? 'Elevated personal exposure indicator. Airway irritation potential increases if exercising outdoors.'
                : 'Personalized exposure indicator remains within manageable physiological limits for your profile.'}
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 9. FINAL AEROCARE SUMMARY PANEL & RECALIBRATE ACTION */}
        {/* ============================================================ */}
        <div
          id="trends-final-summary"
          className="bg-zinc-900/50 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-zinc-800 mb-8 relative overflow-hidden shadow-2xl"
        >
          {/* Subtle Ambient Accent */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FF5C4D]/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 space-y-8">
            {/* Header: AEROCARE DAILY INTELLIGENCE COMPLETE */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#63D9B3]/15 border border-[#63D9B3]/30 text-[#63D9B3] text-xs font-mono uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#63D9B3]" />
                  <span>AEROCARE DAILY INTELLIGENCE COMPLETE</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-light text-white">
                  Environmental Intelligence Journey Finalized
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-light mt-1 max-w-2xl">
                  AeroCare didn&apos;t just show today&apos;s weather. It synthesized your physiology, atmospheric chemistry, and daily itinerary into an adaptive shield.
                </p>
              </div>

              {/* Recalibrate CTA Button */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  id="trends-recalibrate-btn"
                  onClick={onScrollToTop}
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-[#FF5C4D] hover:text-white text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,92,77,0.4)] cursor-pointer hover:scale-105"
                >
                  <RotateCcw className="w-4 h-4 text-current" />
                  <span>↻ Recalibrate AeroCare</span>
                </button>
              </div>
            </div>

            {/* Visual Journey Stages Flow */}
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-4">
                INTELLIGENCE SYNTHESIS PIPELINE AUDIT
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { step: '01', title: 'Atmosphere Analyzed', icon: '🌦', status: 'Optimal' },
                  { step: '02', title: 'Bio-Profile Calibrated', icon: '👤', status: userProfile.healthCondition },
                  { step: '03', title: 'AI Synthesized', icon: '🧠', status: 'Multi-Stream' },
                  { step: '04', title: 'Impact Assessed', icon: '🚨', status: assessment.riskLevel },
                  { step: '05', title: 'Plan Generated', icon: '📅', status: '3 Windows' },
                  { step: '06', title: 'Trends Explored', icon: '📈', status: '24h Model' }
                ].map((item, idx) => (
                  <div
                    key={item.step}
                    className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col justify-between space-y-2 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-[10px] font-mono text-[#63D9B3]">✓ {item.step}</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-white block leading-tight">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 capitalize block mt-0.5">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Action Link */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-zinc-500 font-mono">
              <span>AeroCare AI Engine v4.8 • Grounded in Environmental Sensing Data</span>
              <button
                onClick={onNavigateToProfile}
                className="hover:text-[#FF5C4D] transition-colors underline underline-offset-4 cursor-pointer"
              >
                Modify Bio-Profile Parameters →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

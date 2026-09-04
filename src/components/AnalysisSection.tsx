import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  CloudSun,
  Wind,
  User,
  Activity,
  ArrowRight,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Zap,
  Terminal,
  Brain,
  Fingerprint,
  Radio,
  Layers,
  Shield,
  Heart,
  Sun,
  Flame,
  CornerDownRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { EnvironmentalData, UserProfile, HealthRiskAssessment } from '../types';

interface AnalysisSectionProps {
  currentCity: EnvironmentalData;
  userProfile: UserProfile;
  assessment: HealthRiskAssessment;
  onScrollToNext: () => void;
}

export const AnalysisSection: React.FC<AnalysisSectionProps> = ({
  currentCity,
  userProfile,
  assessment,
  onScrollToNext,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);

  // Cinematic reveal stages (1: header, 2: weather, 3: air quality, 4: bio profile, 5: conduits, 6: AI engine ready)
  const [revealStage, setRevealStage] = useState(0);

  // Interactive stream hover state for highlighting connections
  const [hoveredStream, setHoveredStream] = useState<number | null>(null);

  // AI Processing status cycle
  const [processingPhase, setProcessingPhase] = useState<number>(0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisComplete, setSynthesisComplete] = useState(false);
  const [shockwaveActive, setShockwaveActive] = useState(false);

  // Terminal log lines progressively written
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  // Processing status messages that cycle during analysis
  const statusMessages = [
    'INITIALIZING MULTI-STREAM ANALYSIS',
    'CORRELATING ENVIRONMENTAL SIGNALS',
    'MAPPING BIOLOGICAL VULNERABILITY',
    'GENERATING PERSONALIZED HEALTH MODEL',
    'AI HEALTH INTELLIGENCE SYNTHESIZED ✓',
    'PERSONALIZED RISK MODEL READY'
  ];

  // Intersection Observer for Cinematic Entry Sequence
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

    // Initial check
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
      setHasEntered(true);
    }

    return () => observer.disconnect();
  }, []);

  // Staggered sequence upon section entry
  useEffect(() => {
    if (!hasEntered) return;

    // Reveal header immediately
    setRevealStage(1);

    // Stream 1 (Weather) at 350ms
    const t1 = setTimeout(() => setRevealStage(2), 350);
    // Stream 2 (Air Quality) at 700ms
    const t2 = setTimeout(() => setRevealStage(3), 700);
    // Stream 3 (Bio Profile) at 1050ms
    const t3 = setTimeout(() => setRevealStage(4), 1050);
    // Conduits activate at 1350ms
    const t4 = setTimeout(() => setRevealStage(5), 1350);
    // AI Engine activates at 1700ms and triggers first synthesis cycle
    const t5 = setTimeout(() => {
      setRevealStage(6);
      triggerSynthesisSequence();
    }, 1700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [hasEntered]);

  // Synthesis procedure with progressive terminal lines & status progression
  const triggerSynthesisSequence = () => {
    setIsSynthesizing(true);
    setSynthesisComplete(false);
    setProcessingPhase(0);
    setTerminalLines([
      '> Telemetry handshake initialized across 3 distributed sensory streams...'
    ]);

    // Step 1: Weather correlation
    setTimeout(() => {
      setProcessingPhase(1);
      setTerminalLines((prev) => [
        ...prev,
        `> Atmospheric conditions correlated: ${currentCity.temperature}°C (Feels ${currentCity.feelsLike}°C), Humidity ${currentCity.humidity}%, Solar UV ${currentCity.uvIndex}/12`
      ]);
    }, 600);

    // Step 2: Air quality correlation
    setTimeout(() => {
      setProcessingPhase(2);
      setTerminalLines((prev) => [
        ...prev,
        `> Environmental particulate data received: PM2.5 (${currentCity.pollutants.pm25} µg/m³), O3 (${currentCity.pollutants.o3} ppb), AQI ${currentCity.aqi} [${currentCity.aqiCategory.toUpperCase()}]`
      ]);
    }, 1200);

    // Step 3: Biological mapping
    setTimeout(() => {
      setProcessingPhase(3);
      setTerminalLines((prev) => [
        ...prev,
        `> Bio-profile sensitivity mapped: Cohort [${userProfile.ageGroup.toUpperCase()}], Vulnerability [${userProfile.healthCondition.replace('_', ' ').toUpperCase()}], Exposure [${userProfile.outdoorExposure.toUpperCase()}]`
      ]);
    }, 1800);

    // Step 4: AI Model Synthesis & Convergence Moment
    setTimeout(() => {
      setProcessingPhase(4);
      setTerminalLines((prev) => [
        ...prev,
        `> Neural pathways converged: Multi-variate exposure model calculated.`
      ]);

      // Trigger satisfaction shockwave
      setShockwaveActive(true);
      setTimeout(() => setShockwaveActive(false), 1200);
    }, 2400);

    // Step 5: Completed status
    setTimeout(() => {
      setProcessingPhase(5);
      setTerminalLines((prev) => [
        ...prev,
        `> Personalized health intelligence generated: RISK SCORE ${assessment.riskScore}/100 [${assessment.riskLevel.toUpperCase()}]. Tactical defense model armed.`
      ]);
      setIsSynthesizing(false);
      setSynthesisComplete(true);
    }, 3000);
  };

  // Re-run synthesis if city or profile changes
  useEffect(() => {
    if (revealStage >= 6) {
      triggerSynthesisSequence();
    }
  }, [currentCity.city, userProfile.healthCondition, userProfile.outdoorExposure, userProfile.ageGroup]);

  // Risk styling
  const riskColor = {
    low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    moderate: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    extreme: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  }[assessment.riskLevel] || 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  return (
    <section
      ref={sectionRef}
      id="analysis"
      className="relative min-h-screen w-full flex flex-col justify-center px-4 sm:px-8 py-24 earth-section text-zinc-100 overflow-hidden"
    >
      {/* Background Neural Grid and ambient illumination */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-emerald-500/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-sky-500/5 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[140px] rounded-full" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 quiet-grid" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* ============================================================ */}
        {/* 1. CINEMATIC SECTION ENTRY HEADER */}
        {/* ============================================================ */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 transition-all duration-700 ${
            revealStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-2 story-kicker mb-3">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Neural Pipeline 04 // AI Synthesis Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-light tracking-tight flex items-center gap-3 flex-wrap">
              <span>AI Multi-Stream Synthesis</span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-normal">
                {isSynthesizing ? 'INFERENCE ACTIVE' : 'FUSION READY'}
              </span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
              Atmospheric telemetry and particulate chemistry alone cannot predict human health. AeroCare’s neural engine fuses live environmental stressors with your calibrated Digital You.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="analysis-recalibrate-btn"
              onClick={triggerSynthesisSequence}
              disabled={isSynthesizing}
              className="px-4 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-emerald-500/15 hover:border-emerald-500/40 border border-zinc-700 text-zinc-200 hover:text-emerald-300 text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span>{isSynthesizing ? 'Processing Neural Streams...' : 'Recalibrate AI Synthesis'}</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2 & 3. THREE DATA STREAMS + DATA CONVERGENCE MANIFOLD */}
        {/* ============================================================ */}
        <div className="relative mb-8">
          {/* Incoming Stream Cards Grid (3 Inputs) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-20">
            {/* -------------------------------------------------------- */}
            {/* STREAM 01: WEATHER DATA */}
            {/* -------------------------------------------------------- */}
            <div
              id="analysis-stream-weather"
              onMouseEnter={() => setHoveredStream(1)}
              onMouseLeave={() => setHoveredStream(null)}
              className={`p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden backdrop-blur-xl group cursor-pointer ${
                revealStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${
                hoveredStream === 1
                  ? 'bg-zinc-900/90 border-orange-500/45 -translate-y-1'
                  : 'bg-zinc-900/50 border-zinc-800/90 hover:border-orange-500/40'
              }`}
            >
              {/* Dynamic glowing signal edge on top */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-70" />

              {/* Active environmental signal pulses */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 relative">
                  <CloudSun className="w-5 h-5" />
                  {/* Small orbiting particle */}
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-400/70" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400/70" />
                  <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                    Stream 01 // Weather
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                <span>Weather Data</span>
                <span className="text-[10px] font-mono text-zinc-500 font-normal">[{currentCity.city}]</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1 mb-3 font-light leading-relaxed">
                Atmospheric boundary thermal gradients, relative humidity, and solar UV radiation.
              </p>

              {/* Data parameters list */}
              <div className="space-y-1.5 text-[11px] font-mono text-zinc-300 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Sun className="w-3 h-3 text-orange-400" />
                    Thermal Load:
                  </span>
                  <span className="text-orange-300 font-semibold">{currentCity.temperature}°C (Feels {currentCity.feelsLike}°C)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-sky-400" />
                    Relative Humidity:
                  </span>
                  <span className="text-sky-300">{currentCity.humidity}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    Solar UV Index:
                  </span>
                  <span className="text-amber-300">{currentCity.uvIndex} / 12</span>
                </div>
              </div>

              {/* Bottom Outflow Transmitter Port */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500 uppercase">SIGNAL: TRANSMITTING</span>
                <span className="text-orange-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  FEEDING AI
                </span>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* STREAM 02: AIR QUALITY MATRIX */}
            {/* -------------------------------------------------------- */}
            <div
              id="analysis-stream-aqi"
              onMouseEnter={() => setHoveredStream(2)}
              onMouseLeave={() => setHoveredStream(null)}
              className={`p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden backdrop-blur-xl group cursor-pointer ${
                revealStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${
                hoveredStream === 2
                  ? 'bg-zinc-900/90 border-sky-500/45 -translate-y-1'
                  : 'bg-zinc-900/50 border-zinc-800/90 hover:border-sky-500/40'
              }`}
            >
              {/* Dynamic glowing signal edge on top */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-70" />

              {/* Active atmospheric chemical signal pulses */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 relative">
                  <Wind className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sky-400/70" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400/70" />
                  <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    Stream 02 // Atmosphere
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                <span>Air Quality Matrix</span>
                <span className="text-[10px] font-mono text-zinc-500 font-normal">[AQI {currentCity.aqi}]</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1 mb-3 font-light leading-relaxed">
                Chemical toxicological density, respirable PM2.5 aerosols, and ground-level tropospheric ozone.
              </p>

              {/* Data parameters list */}
              <div className="space-y-1.5 text-[11px] font-mono text-zinc-300 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">AQI Category:</span>
                  <span className="text-emerald-300 font-semibold">{currentCity.aqiCategory}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">PM2.5 Mass:</span>
                  <span className="text-sky-300 font-semibold">{currentCity.pollutants.pm25} µg/m³</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">O3 Tropospheric:</span>
                  <span className="text-amber-300 font-semibold">{currentCity.pollutants.o3} ppb</span>
                </div>
              </div>

              {/* Bottom Outflow Transmitter Port */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500 uppercase">SIGNAL: TRANSMITTING</span>
                <span className="text-sky-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  FEEDING AI
                </span>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* STREAM 03: PERSONAL BIO-PROFILE (DIGITAL YOU) */}
            {/* -------------------------------------------------------- */}
            <div
              id="analysis-stream-bio"
              onMouseEnter={() => setHoveredStream(3)}
              onMouseLeave={() => setHoveredStream(null)}
              className={`p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden backdrop-blur-xl group cursor-pointer ${
                revealStage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${
                hoveredStream === 3
                  ? 'bg-zinc-900/90 border-purple-500/45 -translate-y-1'
                  : 'bg-zinc-900/50 border-zinc-800/90 hover:border-purple-500/40'
              }`}
            >
              {/* Dynamic glowing signal edge on top */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70" />

              {/* Active biological signal pulses */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 relative">
                  <Fingerprint className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400/70" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400/70" />
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    Stream 03 // Digital You
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                <span>Personal Bio-Profile</span>
                <span className="text-[10px] font-mono text-zinc-500 font-normal">[TWIN ACTIVE]</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1 mb-3 font-light leading-relaxed">
                Subject vulnerability curve, respiratory susceptibility, and daily outdoor exposure dosage.
              </p>

              {/* Data parameters list */}
              <div className="space-y-1.5 text-[11px] font-mono text-zinc-300 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Demographic:</span>
                  <span className="capitalize text-purple-300 font-semibold">{userProfile.ageGroup}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Vulnerability:</span>
                  <span className="capitalize text-rose-300 font-semibold">{userProfile.healthCondition.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Daily Exposure:</span>
                  <span className="capitalize text-amber-300 font-semibold">{userProfile.outdoorExposure} dosage</span>
                </div>
              </div>

              {/* Bottom Outflow Transmitter Port */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500 uppercase">SIGNAL: TRANSMITTING</span>
                <span className="text-purple-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  FEEDING AI
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CONVERGENCE CONDUIT MANIFOLD (Animated Signal Streams) */}
          {/* ============================================================ */}
          <div className="w-full py-4 relative my-2 overflow-hidden flex flex-col items-center">
            {/* SVG Visual Convergence Lines */}
            <div className="w-full max-w-5xl h-24 sm:h-28 relative">
              <svg
                viewBox="0 0 1000 120"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Conduits Linear Gradients */}
                  <linearGradient id="streamGradWeather" x1="0%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="streamGradAqi" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="streamGradBio" x1="100%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Base background conduit tracks */}
                <path
                  d="M 166,0 C 166,60 480,40 500,120"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="4"
                />
                <path
                  d="M 500,0 L 500,120"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="4"
                />
                <path
                  d="M 833,0 C 833,60 520,40 500,120"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="4"
                />

                {/* Active Animated Glowing Data Conduits (Feeding into the Center AI Engine) */}
                {/* 1. Weather Data Conduit (Orange -> Green) */}
                <path
                  d="M 166,0 C 166,60 480,40 500,120"
                  fill="none"
                  stroke="url(#streamGradWeather)"
                  strokeWidth={hoveredStream === 1 ? '5' : '2.5'}
                  className="animate-ai-conduit-flow"
                  style={{
                    filter: hoveredStream === 1 ? 'drop-shadow(0 0 10px #f97316)' : 'drop-shadow(0 0 4px #f97316)',
                    opacity: hoveredStream === null || hoveredStream === 1 ? 1 : 0.4
                  }}
                />

                {/* 2. Air Quality Conduit (Cyan -> Green) */}
                <path
                  d="M 500,0 L 500,120"
                  fill="none"
                  stroke="url(#streamGradAqi)"
                  strokeWidth={hoveredStream === 2 ? '5' : '2.5'}
                  className="animate-ai-conduit-flow"
                  style={{
                    filter: hoveredStream === 2 ? 'drop-shadow(0 0 10px #38bdf8)' : 'drop-shadow(0 0 4px #38bdf8)',
                    opacity: hoveredStream === null || hoveredStream === 2 ? 1 : 0.4
                  }}
                />

                {/* 3. Bio Profile Conduit (Purple -> Green) */}
                <path
                  d="M 833,0 C 833,60 520,40 500,120"
                  fill="none"
                  stroke="url(#streamGradBio)"
                  strokeWidth={hoveredStream === 3 ? '5' : '2.5'}
                  className="animate-ai-conduit-flow"
                  style={{
                    filter: hoveredStream === 3 ? 'drop-shadow(0 0 10px #a855f7)' : 'drop-shadow(0 0 4px #a855f7)',
                    opacity: hoveredStream === null || hoveredStream === 3 ? 1 : 0.4
                  }}
                />

                {/* Convergence Central Vortex Port */}
                <circle cx="500" cy="115" r="8" fill="#10b981" opacity="0.7" />
                <circle cx="500" cy="115" r="5" fill="#34d399" />
              </svg>
            </div>

            {/* Live Data Fusion Badge in between */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.2)] -mt-3 z-30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>DATA CONVERGENCE CONDUIT // 3 INCOMING SIGNALS</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* ============================================================ */}
          {/* 4. AI ENGINE ACTIVATION (Focal Point Card) */}
          {/* ============================================================ */}
          <div
            id="ai-engine-core-card"
            className={`w-full rounded-3xl p-6 sm:p-8 md:p-10 border transition-all duration-700 relative overflow-hidden backdrop-blur-2xl ${
              revealStage >= 6 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } ${
              synthesisComplete
                ? 'bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-zinc-900/90 border-emerald-500/60 shadow-[0_0_60px_rgba(16,185,129,0.22)] ring-1 ring-emerald-500/30'
                : 'bg-zinc-900/70 border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
            }`}
          >
            {/* Background Holographic Scanlines & Radial Glow */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:100%_4px] pointer-events-none opacity-40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Satisfaction Shockwave Expansion on completion */}
            {shockwaveActive && (
              <div className="absolute inset-0 rounded-3xl border-2 border-emerald-400 pointer-events-none animate-ai-shockwave" />
            )}

            {/* Laser scanning beam moving vertically */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] pointer-events-none animate-bio-scan-sweep opacity-75 z-20" />

            {/* Core Card Content Grid */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column (5 cols): Central Neural Engine Reactor & Holographic Gyroscope */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-4">
                {/* Visual Neural Core with Orbiting Rings */}
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center mb-5 select-none">
                  {/* Outer Orbital Ring 1 */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/30 animate-ai-core-rotate-cw pointer-events-none" />
                  {/* Outer Orbital Ring 2 (Counter-Clockwise) */}
                  <div className="absolute inset-3 rounded-full border border-emerald-400/20 animate-ai-core-rotate-ccw pointer-events-none" />
                  {/* Inner Ring with Tick Markers */}
                  <div className="absolute inset-7 rounded-full border-2 border-emerald-500/40 pointer-events-none flex items-center justify-center">
                    <div className="absolute top-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    <div className="absolute bottom-0 w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                    <div className="absolute left-0 w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_6px_#f97316]" />
                    <div className="absolute right-0 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7]" />
                  </div>

                  {/* Pulsing Core Aura */}
                  <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 blur-xl animate-ai-core-pulse" />

                  {/* Central Brain/Neural Core Orb */}
                  <div className="relative w-20 h-20 rounded-2xl bg-zinc-950 border-2 border-emerald-400 flex flex-col items-center justify-center text-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.28)] group">
                    <Brain className="w-9 h-9" />
                    <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-300 mt-1">
                      AERO-AI
                    </span>
                  </div>
                </div>

                {/* Animated Status Message Cycler */}
                <div className="w-full">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1 flex items-center justify-center gap-1.5">
                    <Radio className="w-3 h-3 text-emerald-400" />
                    <span>ENGINE PHASE 0{processingPhase + 1} // REAL-TIME INFERENCE</span>
                  </div>

                  <div className="h-9 flex items-center justify-center">
                    <div className="px-3.5 py-1.5 rounded-full bg-zinc-950/80 border border-emerald-500/30 text-emerald-300 font-mono text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{statusMessages[processingPhase] || statusMessages[statusMessages.length - 1]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): Synthesized Intelligence Telemetry Metrics */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div className="border-b border-zinc-800 pb-4 mb-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      Synthesized Health Output Matrix
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      CONFIDENCE: <strong className="text-emerald-400 font-bold">98.4%</strong> • LATENCY: 14ms
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-light text-white mt-1">
                    Personalized Biological Risk Assessment
                  </h3>
                </div>

                {/* 4 High-Density Synthesized Metric Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                  {/* Tile 1: Computed Risk Level */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                      Computed Risk Status
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-semibold text-white capitalize">
                        {assessment.riskLevel} Risk
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border ${riskColor}`}>
                        {assessment.riskLevel}
                      </span>
                    </div>
                  </div>

                  {/* Tile 2: Physiological Strain Score */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                      Physiological Load Score
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-emerald-400 font-mono">
                        {assessment.riskScore} <span className="text-xs text-zinc-500 font-normal">/ 100</span>
                      </span>
                      {/* Mini Bar Gauge */}
                      <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-1000 rounded-full"
                          style={{ width: `${assessment.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tile 3: Primary Atmospheric Driver */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                      Dominant Stressor Vector
                    </span>
                    <span className="text-sm font-semibold text-zinc-200 truncate">
                      {assessment.primaryDriver}
                    </span>
                  </div>

                  {/* Tile 4: Vulnerable Target System */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                      Vulnerable Anatomical Node
                    </span>
                    <span className="text-sm font-semibold text-rose-300">
                      {userProfile.healthCondition === 'asthma'
                        ? 'Bronchial & Alveolar Matrix'
                        : userProfile.healthCondition === 'heart_condition'
                        ? 'Cardiovascular Arterial Tone'
                        : 'Epithelial Surface Barrier'}
                    </span>
                  </div>
                </div>

                {/* Synthesis Confirmation Banner (The Synthesis Moment 💥) */}
                <div
                  className={`p-3.5 rounded-xl border transition-all duration-500 flex items-center justify-between ${
                    synthesisComplete
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 ${synthesisComplete ? 'text-emerald-400 animate-bounce' : 'text-zinc-500'}`} />
                    <span className="text-xs font-mono font-bold">
                      {synthesisComplete ? 'AI HEALTH INTELLIGENCE SYNTHESIZED ✓' : 'SYNTHESIS IN PROGRESS...'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline">
                    PERSONALIZED RISK MODEL READY
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. LIVE ANALYSIS TERMINAL (Progressive Real-Time Inference Log) */}
        {/* ============================================================ */}
        <div className="bg-zinc-900/60 rounded-2xl p-5 border border-zinc-800 font-mono text-xs text-zinc-300 mb-8 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3 text-[11px] text-zinc-400 flex-wrap gap-2">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <strong className="text-zinc-200">AEROCARE INFERENCE TERMINAL // MULTI-STREAM FUSION ENGINE v4.2</strong>
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                PIPELINE: SYNCHRONOUS
              </span>
              <span className="text-zinc-500">THREADS: 8/8 ACTIVE</span>
            </div>
          </div>

          <div className="space-y-2 text-[11px] sm:text-xs leading-relaxed max-h-48 overflow-y-auto">
            {terminalLines.map((line, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold select-none">&gt;</span>
                <span className={index === terminalLines.length - 1 ? 'text-emerald-300 font-medium' : 'text-zinc-400'}>
                  {line}
                </span>
              </div>
            ))}
            {/* Blinking Terminal Cursor */}
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="select-none">&gt;</span>
              <span className="inline-block w-2.5 h-4 bg-emerald-400 animate-ai-terminal-cursor" />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 7. PREPARE FOR HEALTH RISK SECTION (Downstream Data Conduit) */}
        {/* ============================================================ */}
        <div className="relative pt-4 flex flex-col items-center text-center">
          {/* Animated signal particles flowing downward toward the next section */}
          <div className="w-[2px] h-14 bg-gradient-to-b from-emerald-400 via-sky-400 to-transparent relative mb-3 overflow-hidden">
            <div className="w-full h-4 bg-white rounded-full animate-bio-synth-stream-1 shadow-[0_0_8px_#ffffff]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold uppercase tracking-wider">
              ANALYSIS COMPLETE → PROCEEDING TO PERSONALIZED HEALTH RISK
            </span>
          </div>

          <p className="text-xs text-zinc-400 max-w-md font-light mb-4">
            The multi-stream neural correlation model is now armed with your real-time physiological vulnerability parameters.
          </p>

          <button
            id="analysis-to-risk-btn"
            onClick={onScrollToNext}
            className="px-8 py-3.5 bg-white text-black hover:bg-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(52,211,153,0.5)] transform hover:scale-105"
          >
            <span>Proceed to 05 Health Risk Analysis</span>
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </section>
  );
};


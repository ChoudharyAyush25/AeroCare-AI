import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Wind,
  Heart,
  Brain,
  Sun,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Sparkles,
  Zap,
  Radio,
  ArrowRight,
  TrendingUp,
  Target
} from 'lucide-react';
import {
  HealthRiskAssessment,
  UserProfile,
  EnvironmentalData,
  RiskLevel,
  BiologicalImpact
} from '../types';

interface RiskSectionProps {
  assessment: HealthRiskAssessment;
  userProfile: UserProfile;
  currentCity: EnvironmentalData;
  onOverrideRiskLevel?: (level: RiskLevel) => void;
  onScrollToNext: () => void;
}

export const RiskSection: React.FC<RiskSectionProps> = ({
  assessment,
  userProfile,
  currentCity,
  onOverrideRiskLevel,
  onScrollToNext,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);

  // Cinematic entry loading phases:
  // stage 0: Loading scanner (ANALYZING FINAL HEALTH CORRELATIONS...)
  // stage 1: Main score counting up
  // stage 2: Score complete, revealing factor cards
  // stage 3: Full assessment active (PERSONALIZED ENVIRONMENTAL IMPACT ASSESSED ✓)
  const [revealStage, setRevealStage] = useState<number>(0);

  const [simulationLevel, setSimulationLevel] = useState<RiskLevel | null>(null);
  const activeLevel = simulationLevel || assessment.riskLevel;

  // Calculated display target score based on simulated level or real assessment
  const targetScore = simulationLevel
    ? simulationLevel === 'low'
      ? 24
      : simulationLevel === 'moderate'
      ? 46
      : simulationLevel === 'high'
      ? 68
      : 89
    : assessment.riskScore;

  // Animated score counter (0 -> targetScore)
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const [barProgressReady, setBarProgressReady] = useState(false);

  // Theme configuration for the 4 dynamic risk levels
  const levelThemes: Record<
    RiskLevel,
    {
      title: string;
      color: string;
      borderColor: string;
      border: string;
      bg: string;
      glow: string;
      halo: string;
      badge: string;
      icon: React.ComponentType<{ className?: string }>;
      description: string;
      actionUrgency: string;
      statusTag: string;
    }
  > = {
    low: {
      title: 'Low Environmental Risk',
      color: 'text-emerald-400',
      borderColor: '#10b981',
      border: 'border-emerald-500/40',
      bg: 'from-emerald-950/20 via-zinc-950 to-[#050505]',
      glow: 'rgba(16, 185, 129, 0.16)',
      halo: 'rgba(16, 185, 129, 0.28)',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      icon: ShieldCheck,
      description: 'Atmospheric conditions represent minimal physiological threat to your bio-profile. Routine ventilation and normal outdoor exertion permitted.',
      actionUrgency: 'Baseline precautions only.',
      statusTag: 'EQUILIBRIUM'
    },
    moderate: {
      title: 'Moderate Health Sensitivity',
      color: 'text-amber-400',
      borderColor: '#f59e0b',
      border: 'border-amber-500/40',
      bg: 'from-amber-950/20 via-zinc-950 to-[#050505]',
      glow: 'rgba(245, 158, 11, 0.16)',
      halo: 'rgba(245, 158, 11, 0.28)',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      icon: AlertTriangle,
      description: 'Minor respiratory and microvascular friction detected. Sensitive individuals may experience mild airway tightness during strenuous midday exertion.',
      actionUrgency: 'Guard sensitive individuals during midday.',
      statusTag: 'SENSITIVE'
    },
    high: {
      title: 'High Biological Vulnerability',
      color: 'text-orange-400',
      borderColor: '#f97316',
      border: 'border-orange-500/40',
      bg: 'from-orange-950/25 via-zinc-950 to-[#050505]',
      glow: 'rgba(249, 115, 22, 0.2)',
      halo: 'rgba(249, 115, 22, 0.35)',
      badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      icon: Flame,
      description: 'Substantial air toxicant concentration interacting with personal sensitivities. Elevated risk of bronchospasms, cardiac exertion, and systemic inflammation.',
      actionUrgency: 'Active indoor filtration and protective respirators.',
      statusTag: 'VULNERABLE'
    },
    severe: {
      title: 'Severe Acute Health Hazard',
      color: 'text-rose-400',
      borderColor: '#f43f5e',
      border: 'border-rose-500/40',
      bg: 'from-rose-950/30 via-zinc-950 to-[#050505]',
      glow: 'rgba(244, 63, 94, 0.25)',
      halo: 'rgba(244, 63, 94, 0.45)',
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      icon: ShieldAlert,
      description: 'Hazardous atmospheric condition. Particulate and oxidant concentrations pose immediate physiological stress across all age groups, especially vulnerable profiles.',
      actionUrgency: 'Remain indoors; avoid all outdoor exertion.',
      statusTag: 'ACUTE HAZARD'
    }
  };

  const theme = levelThemes[activeLevel];
  const IconComponent = theme.icon;

  // Intersection Observer for Cinematic Entry Trigger
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

  // Cinematic Entry Sequence Timeline
  useEffect(() => {
    if (!hasEntered) return;

    // Phase 0: Scanning / Loading state for 1000ms
    setRevealStage(0);

    const timer1 = setTimeout(() => {
      // Phase 1: Reveal Main Assessment & start score count-up
      setRevealStage(1);
    }, 1000);

    return () => clearTimeout(timer1);
  }, [hasEntered]);

  // Smooth score count-up animation
  useEffect(() => {
    if (revealStage < 1) {
      setAnimatedScore(0);
      setBarProgressReady(false);
      return;
    }

    let start = 0;
    const end = targetScore;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (end - start) * easeOut);

      setAnimatedScore(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setAnimatedScore(end);
        setRevealStage(2);
        // Stagger biological factor progress bars
        setTimeout(() => {
          setBarProgressReady(true);
          setRevealStage(3);
        }, 200);
      }
    };

    requestAnimationFrame(animateCount);
  }, [revealStage >= 1, targetScore, activeLevel]);

  // Biological icon helper
  const getBioIcon = (cat: string) => {
    switch (cat) {
      case 'respiratory':
        return Activity;
      case 'cardiovascular':
        return Heart;
      case 'cognitive':
        return Brain;
      case 'skinUv':
        return Sun;
      default:
        return Activity;
    }
  };

  // Check if an impact card matches the primary driver
  const isPrimaryDriverMatch = (impact: BiologicalImpact) => {
    const driver = assessment.primaryDriver.toLowerCase();
    if (impact.category === 'respiratory' && (driver.includes('pm2.5') || driver.includes('particulate') || driver.includes('ozone') || driver.includes('respiratory'))) {
      return true;
    }
    if (impact.category === 'cardiovascular' && (driver.includes('cardio') || driver.includes('heart') || driver.includes('blood'))) {
      return true;
    }
    if (impact.category === 'skinUv' && (driver.includes('uv') || driver.includes('solar') || driver.includes('radiation'))) {
      return true;
    }
    return false;
  };

  return (
    <section
      ref={sectionRef}
      id="risk"
      className="relative min-h-screen w-full flex flex-col justify-center px-4 sm:px-8 py-24 earth-section text-zinc-100 overflow-hidden transition-colors duration-700"
    >
      {/* Dynamic atmospheric ambient background glow reacting to active risk level */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden transition-all duration-700">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full blur-[160px] pointer-events-none transition-all duration-700 animate-risk-pulse"
          style={{ background: theme.glow }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-[450px] h-[450px] rounded-full blur-[140px] pointer-events-none opacity-40 transition-all duration-700"
          style={{ background: theme.halo }}
        />
        {/* Subtle grid texture */}
        <div className="absolute inset-0 quiet-grid" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* ============================================================ */}
        {/* 1. CINEMATIC ENTRY / SCANNER OVERLAY (Before Assessment Reveal) */}
        {/* ============================================================ */}
        {revealStage === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              {/* Outer rotating scanner ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/40 animate-risk-scanner" />
              <div className="absolute inset-2 rounded-full border border-emerald-500/20 animate-risk-scanner-reverse" />
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] animate-pulse">
                <Target className="w-6 h-6 animate-spin" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-emerald-500/30 text-emerald-300 text-xs font-mono uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>PERSONALIZED ASSESSMENT READY</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-light text-white font-mono tracking-wide mt-1">
              ANALYZING FINAL HEALTH CORRELATIONS...
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-2">
              Fusing atmospheric chemistry with calibrated Digital You biomarkers
            </p>
          </div>
        )}

        {/* ============================================================ */}
        {/* MAIN HEALTH RISK EXPERIENCE (Revealed after Scanner) */}
        {/* ============================================================ */}
        <div className={`transition-all duration-700 ${revealStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
          {/* Section Header & Interactive Simulation Switcher */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-3 shadow-sm">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>Bio-Impact Verdict 05 // Personalized Health Risk</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-light tracking-tight flex items-center gap-3 flex-wrap">
                <span>Personalized Health Risk</span>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${theme.badge} font-semibold uppercase tracking-wide`}>
                  {activeLevel} Risk Alert
                </span>
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
                Synthesized from your personal biomarkers ({userProfile.ageGroup}, {userProfile.healthCondition.replace('_', ' ')}, {userProfile.outdoorExposure} exposure) and {currentCity.location}&apos;s live atmospheric load.
              </p>
            </div>

            {/* Interactive Simulation Switcher: Test all 4 states with silky transitions */}
            <div className="flex flex-col items-start md:items-end gap-1.5">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono text-zinc-400">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Explore Risk States</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-900/80 border border-zinc-800 shadow-inner">
                {(['low', 'moderate', 'high', 'severe'] as RiskLevel[]).map((lvl) => {
                  const isSelected = activeLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      id={`risk-tab-${lvl}`}
                      onClick={() => {
                        setSimulationLevel(lvl);
                        if (onOverrideRiskLevel) onOverrideRiskLevel(lvl);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? `${levelThemes[lvl].badge} font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105`
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
                {simulationLevel && (
                  <button
                    onClick={() => setSimulationLevel(null)}
                    className="px-2.5 py-1 rounded text-[10px] font-mono text-zinc-500 hover:text-zinc-300 hover:underline cursor-pointer"
                    title="Reset to live calculated score"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 2. THE MAIN HEALTH SCORE — BIG WOW MOMENT CARD */}
          {/* ============================================================ */}
          <div
            id="risk-hero-reveal"
            className={`rounded-3xl p-6 sm:p-10 border ${theme.border} bg-zinc-900/50 backdrop-blur-2xl shadow-2xl mb-8 relative overflow-hidden transition-all duration-700`}
            style={{
              boxShadow: `0 0 50px ${theme.glow}`
            }}
          >
            {/* Subtle animated scanline */}
            <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20 pointer-events-none animate-risk-scanline" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left: Dramatic Circular Bio-Shield Risk Gauge (5 columns) */}
              <div className="lg:col-span-5 flex flex-col items-center text-center">
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center select-none">
                  {/* Outer Glow Halo reacting to risk state */}
                  <div
                    className="absolute inset-2 rounded-full blur-2xl opacity-70 transition-all duration-700 animate-risk-pulse"
                    style={{ background: theme.glow }}
                  />

                  {/* Rotating Scanner Tick Ring */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-zinc-700/60 animate-risk-scanner pointer-events-none" />
                  <div className="absolute inset-3 rounded-full border border-zinc-800 animate-risk-scanner-reverse pointer-events-none" />

                  {/* SVG Radial Meter with animated stroke and gradient */}
                  <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 220 220">
                    <defs>
                      <linearGradient id="scoreProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor={theme.borderColor} />
                      </linearGradient>
                    </defs>

                    {/* Track */}
                    <circle
                      cx="110"
                      cy="110"
                      r="92"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="14"
                      fill="transparent"
                    />

                    {/* Dynamic animated progress circle */}
                    <circle
                      cx="110"
                      cy="110"
                      r="92"
                      stroke={activeLevel === 'low' ? '#10b981' : activeLevel === 'moderate' ? '#f59e0b' : activeLevel === 'high' ? '#f97316' : '#f43f5e'}
                      strokeWidth="14"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 92}
                      strokeDashoffset={2 * Math.PI * 92 * (1 - animatedScore / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-300 ease-out"
                      style={{
                        filter: `drop-shadow(0 0 10px ${theme.borderColor})`
                      }}
                    />

                    {/* Glowing head point on the circle */}
                    <circle
                      cx="110"
                      cy="18"
                      r="4"
                      fill="#ffffff"
                      className="animate-ping opacity-75"
                    />
                  </svg>

                  {/* Center Score & Icon Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center mb-1.5 shadow-inner">
                      <IconComponent className={`w-7 h-7 ${theme.color} transition-all duration-500`} />
                    </div>

                    {/* Live Count-Up Score */}
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl sm:text-6xl font-mono font-light text-white tracking-tight">
                        {animatedScore}
                      </span>
                      <span className="text-xs font-mono text-zinc-500 ml-1">/100</span>
                    </div>

                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mt-0.5">
                      HEALTH STRAIN INDEX
                    </span>
                  </div>
                </div>

                {/* Status Readout Below Score */}
                <div className="mt-4 flex flex-col items-center gap-2">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${theme.badge} shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center gap-1.5`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                    <span>{theme.statusTag} // {activeLevel.toUpperCase()} RISK</span>
                  </div>

                  {revealStage >= 2 && (
                    <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 animate-fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PERSONALIZED ENVIRONMENTAL IMPACT ASSESSED ✓</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Detailed Physiological Assessment & Breakdown (7 columns) */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                      Atmospheric Synthesis Verdict
                    </span>
                    {/* Primary Environmental Driver Highlight */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-amber-500/40 text-[11px] font-mono text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                      <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                      <span className="text-zinc-400">PRIMARY ENVIRONMENTAL DRIVER:</span>
                      <strong className="font-bold text-white">{assessment.primaryDriver}</strong>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-light text-white mb-2">
                    {theme.title}
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light mb-6">
                    {theme.description}
                  </p>
                </div>

                {/* ============================================================ */}
                {/* 4. PERSONALIZED BIOLOGICAL RISK FACTORS (Staggered Animations) */}
                {/* ============================================================ */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                    <span className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Target Organ System Susceptibility</span>
                    </span>
                    <span className="font-mono text-zinc-400 text-[11px]">Biological Strain Breakdown</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {assessment.biologicalImpacts.map((impact, index) => {
                      const BioIcon = getBioIcon(impact.category);
                      const isPrimary = isPrimaryDriverMatch(impact);

                      return (
                        <div
                          key={impact.category}
                          className={`p-4 rounded-2xl bg-zinc-950/90 border transition-all duration-500 space-y-2.5 relative overflow-hidden ${
                            revealStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                          } ${
                            isPrimary
                              ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.18)] ring-1 ring-amber-500/30'
                              : 'border-zinc-800/90 hover:border-zinc-700'
                          }`}
                          style={{
                            transitionDelay: `${index * 120}ms`
                          }}
                        >
                          {/* Highlight Tag for Primary Contributing Factor */}
                          {isPrimary && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                              <Zap className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                              <span>PRIMARY DRIVER</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-0.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                                <BioIcon className="w-4 h-4 text-emerald-400" />
                              </div>
                              <span className="text-xs font-medium text-zinc-200">{impact.title}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-white pr-1">{impact.percentage}%</span>
                          </div>

                          {/* Animated Progress Bar */}
                          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800/80">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                impact.percentage >= 70
                                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                                  : impact.percentage >= 45
                                  ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                                  : 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                              }`}
                              style={{ width: barProgressReady ? `${impact.percentage}%` : '0%' }}
                            />
                          </div>

                          <p className="text-[11px] text-zinc-400 font-light leading-snug">
                            {impact.details}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Action Callout */}
                <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
                        Tactical Health Advisory
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-white">
                        {assessment.keyPrecautions[0] || 'Maintain scheduled indoor air filtration routines.'}
                      </span>
                    </div>
                  </div>

                  <button
                    id="risk-to-plan-btn"
                    onClick={onScrollToNext}
                    className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md transform hover:scale-105"
                  >
                    <span>View Today&apos;s Plan</span>
                    <ChevronRight className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Precautions Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {assessment.keyPrecautions.slice(0, 3).map((precaution, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/60 p-4.5 rounded-2xl border border-zinc-800/90 flex items-start gap-3.5 backdrop-blur-xl hover:border-zinc-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 font-mono text-xs font-bold">
                  0{idx + 1}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  {precaution}
                </p>
              </div>
            ))}
          </div>

          {/* ============================================================ */}
          {/* 7. ACTION TRANSITION TO 06 DAILY PLAN */}
          {/* ============================================================ */}
          <div className="relative pt-2 flex flex-col items-center text-center">
            {/* Animated signal path moving toward the next section */}
            <div className="w-[2px] h-12 bg-gradient-to-b from-emerald-400 via-sky-400 to-transparent relative mb-3 overflow-hidden">
              <div className="w-full h-4 bg-white rounded-full animate-bio-synth-stream-1 shadow-[0_0_8px_#ffffff]" />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-semibold uppercase tracking-wider">
                RISK ASSESSMENT COMPLETE
              </span>
            </div>

            <h4 className="text-sm font-mono text-white tracking-wide mb-1">
              GENERATING YOUR PERSONALIZED DAILY PLAN →
            </h4>
            <p className="text-xs text-zinc-400 max-w-md font-light mb-4">
              AeroCare’s tactical schedule converts your biological risk matrix into time-windowed ventilation and activity directives.
            </p>

            <button
              id="risk-to-plan-cta"
              onClick={onScrollToNext}
              className="px-8 py-3.5 bg-white text-black hover:bg-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(52,211,153,0.5)] transform hover:scale-105"
            >
              <span>Proceed to 06 Personalized Daily Plan</span>
              <ChevronRight className="w-4 h-4 text-black" />
            </button>

            {/* Responsible health guidance disclaimer */}
            <div className="mt-8 text-[11px] font-mono text-zinc-500 max-w-xl text-center leading-relaxed">
              *Environmental Health Guidance: Predictive exposure and physiological stress estimates are synthesized for preventive lifestyle planning and do not constitute clinical diagnosis.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


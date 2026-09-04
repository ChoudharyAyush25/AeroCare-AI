import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Sunrise,
  Sun,
  Sunset,
  Shield,
  Wind,
  CheckCircle,
  AlertCircle,
  Thermometer,
  Sparkles,
  ChevronRight,
  Clock,
  Home,
  Footprints,
  Brain,
  Check,
  Zap,
  ArrowRight,
  Compass,
  Radio,
  CheckCircle2
} from 'lucide-react';
import {
  DayPlan,
  UserProfile,
  EnvironmentalData,
  HealthRiskAssessment,
  TimeSlotRecommendation
} from '../types';

interface PlanSectionProps {
  dayPlan: DayPlan;
  userProfile: UserProfile;
  currentCity: EnvironmentalData;
  assessment: HealthRiskAssessment;
  isCelsius: boolean;
  onScrollToNext: () => void;
}

export const PlanSection: React.FC<PlanSectionProps> = ({
  dayPlan,
  userProfile,
  currentCity,
  assessment,
  isCelsius,
  onScrollToNext,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [entryPhase, setEntryPhase] = useState<number>(0);

  const [activeSlot, setActiveSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  // Track completed actions: keys like 'morning-0', 'afternoon-2', etc.
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const toggleActionCompleted = (actionKey: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [actionKey]: !prev[actionKey]
    }));
  };

  const slotData: TimeSlotRecommendation = dayPlan[activeSlot];

  const formatTemp = (celsius: number) => {
    return isCelsius
      ? `${celsius}°C`
      : `${Math.round((celsius * 9) / 5 + 32)}°F`;
  };

  // Intersection Observer for Cinematic Entry
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
    const t1 = setTimeout(() => setEntryPhase(1), 500);
    const t2 = setTimeout(() => setEntryPhase(2), 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [hasEntered]);

  // Slot Configuration & Living Atmosphere Styles
  const slotConfig = {
    morning: {
      label: 'Morning',
      tagline: 'START YOUR DAY SAFELY',
      time: '06:00 – 11:30',
      icon: Sunrise,
      themeColor: '#10b981',
      ambientGlow: 'rgba(245, 158, 11, 0.12)',
      auroraColor: 'rgba(16, 185, 129, 0.15)',
      accent: 'from-amber-500/10 via-emerald-500/5 to-transparent',
      border: 'border-emerald-500/40',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      tagColor: 'text-amber-300',
      guidance: `Optimal atmospheric boundary conditions before photochemical solar activation. Utilize this window for scheduled outdoor tasks and home cross-ventilation while ground ozone is minimal. Protect airways if ${userProfile.healthCondition.replace('_', ' ')} sensitivities trigger with early morning humidity.`
    },
    afternoon: {
      label: 'Afternoon',
      tagline: 'PROTECT YOURSELF DURING PEAK EXPOSURE',
      time: '12:00 – 17:00',
      icon: Sun,
      themeColor: '#f97316',
      ambientGlow: 'rgba(249, 115, 22, 0.15)',
      auroraColor: 'rgba(245, 158, 11, 0.18)',
      accent: 'from-orange-500/15 via-amber-500/5 to-transparent',
      border: 'border-orange-500/40',
      badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      tagColor: 'text-orange-300',
      guidance: `Thermal updrafts and secondary photochemical pollutants reach peak diurnal concentration. Avoid sustained outdoor aerobic cardio. Ensure protective UV barrier and activate indoor particulate filtration to prevent bronchial strain.`
    },
    evening: {
      label: 'Evening',
      tagline: 'RECOVER AND PREPARE FOR TOMORROW',
      time: '17:30 – 22:30',
      icon: Sunset,
      themeColor: '#38bdf8',
      ambientGlow: 'rgba(56, 189, 248, 0.12)',
      auroraColor: 'rgba(99, 102, 241, 0.16)',
      accent: 'from-sky-500/10 via-indigo-500/5 to-transparent',
      border: 'border-sky-500/40',
      badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      tagColor: 'text-sky-300',
      guidance: `Atmospheric cooling creates boundary inversion, concentrating vehicular and surface particulates. Seal residential windows, shift to cellular recovery, and run air purifiers to optimize nocturnal respiratory regeneration.`
    }
  };

  const currentConfig = slotConfig[activeSlot];

  // Total completed actions count across all periods
  const totalCompletedCount = Object.values(completedActions).filter(Boolean).length;

  return (
    <section
      ref={sectionRef}
      id="plan"
      className="relative min-h-screen w-full flex flex-col justify-center px-4 sm:px-8 py-24 earth-section-muted text-zinc-100 overflow-hidden transition-colors duration-700"
    >
      {/* ============================================================ */}
      {/* 8. THE LIVING DAY ATMOSPHERE (Reacts smoothly to period) */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden transition-all duration-700">
        {/* Living atmospheric ambient glow based on Morning / Afternoon / Evening */}
        <div
          className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] rounded-full blur-[170px] pointer-events-none transition-all duration-700 ${
            activeSlot === 'morning'
              ? 'animate-plan-sunrise'
              : activeSlot === 'afternoon'
              ? 'animate-plan-solar'
              : 'animate-plan-aurora'
          }`}
          style={{ background: currentConfig.ambientGlow }}
        />

        <div
          className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-40 transition-all duration-700"
          style={{ background: currentConfig.auroraColor }}
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
            {/* First reveal: YOUR PERSONALIZED PLAN IS READY */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-3 shadow-sm transition-all duration-500 ${
                entryPhase >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>YOUR PERSONALIZED PLAN IS READY // PROTOCOL 06</span>
            </div>

            {/* Main Heading: Today's Personalized Schedule */}
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl text-white font-light tracking-tight flex items-center gap-3 flex-wrap transition-all duration-700 ${
                entryPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span>Today&apos;s Personalized Schedule</span>
              <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${currentConfig.badge} font-semibold uppercase tracking-wide`}>
                {currentConfig.tagline}
              </span>
            </h2>

            <p
              className={`text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl font-light transition-all duration-700 ${
                entryPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Atmospheric chemistry changes dramatically between dawn, midday, and dusk. AeroCare dynamically phases your ventilation, protection, and outdoor exertion windows.
            </p>
          </div>

          {/* Location & Progress Tracker Header */}
          <div className="flex flex-col items-start md:items-end gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-400">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Location: <strong className="text-white">{currentCity.location}</strong></span>
            </div>

            {/* Daily Actions Completion Counter */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                <strong className="text-emerald-400 font-bold">{totalCompletedCount}</strong> / 12 PROTOCOL ACTIONS COMPLETED
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2 & 9. THE INTERACTIVE DAY TIMELINE (Horizontal Connected Track) */}
        {/* ============================================================ */}
        <div className="mb-8 relative">
          {/* Day Progress Track Line */}
          <div className="relative p-2 rounded-2xl bg-zinc-900/70 border border-zinc-800/90 backdrop-blur-xl shadow-xl overflow-hidden">
            {/* Ambient traveling glowing signal beam across full timeline */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-emerald-500/20 via-white/40 to-sky-500/20 pointer-events-none" />
            <div className="absolute top-1/2 -translate-y-1/2 w-32 h-2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-[2px] pointer-events-none animate-plan-signal" />

            {/* Timeline Switcher Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 relative z-10">
              {(['morning', 'afternoon', 'evening'] as const).map((period) => {
                const isSelected = activeSlot === period;
                const cfg = slotConfig[period];
                const PeriodIcon = cfg.icon;
                const periodData = dayPlan[period];

                // Count completed actions for this specific period
                const periodCompleted = [0, 1, 2, 3].filter(
                  (idx) => completedActions[`${period}-${idx}`]
                ).length;

                return (
                  <button
                    key={period}
                    id={`plan-tab-${period}`}
                    onClick={() => setActiveSlot(period)}
                    className={`p-4 rounded-xl text-left transition-all duration-500 relative flex items-center justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-zinc-950/95 border-2 shadow-[0_0_25px_rgba(0,0,0,0.8)] scale-[1.01]'
                        : 'bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-900/70 hover:border-zinc-700'
                    }`}
                    style={{
                      borderColor: isSelected ? cfg.themeColor : undefined
                    }}
                  >
                    {/* Active period indicator pip */}
                    {isSelected && (
                      <div
                        className="absolute top-0 inset-x-0 h-1 rounded-t-xl"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${cfg.themeColor}, transparent)`
                        }}
                      />
                    )}

                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isSelected
                            ? 'bg-zinc-900 shadow-inner'
                            : 'bg-zinc-800/50 text-zinc-400 group-hover:text-zinc-200'
                        }`}
                        style={{
                          color: isSelected ? cfg.themeColor : undefined
                        }}
                      >
                        <PeriodIcon className={`w-5 h-5 ${isSelected ? 'animate-pulse' : ''}`} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base text-white">
                            {cfg.label}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800/80">
                            {cfg.time}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400 font-light block mt-0.5">
                          AQI {periodData.aqi} • {formatTemp(periodData.temp)} • UV {periodData.uv}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                          periodData.activityRating === 'Recommended'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : periodData.activityRating === 'Caution'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {periodData.activityRating}
                      </span>

                      {/* Small checklist completion status indicator */}
                      <span className="text-[10px] font-mono text-zinc-500">
                        {periodCompleted}/4 done
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 6. AI GUIDANCE MOMENT (Prominent Dynamic AI Callout) */}
        {/* ============================================================ */}
        <div
          id="plan-ai-guidance"
          className="mb-8 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl relative overflow-hidden transition-all duration-500"
          style={{
            boxShadow: `0 0 30px ${currentConfig.ambientGlow}`
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 shadow-inner"
                style={{ color: currentConfig.themeColor }}
              >
                <Brain className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    AEROCARE AI GUIDANCE // {currentConfig.label.toUpperCase()} PROTOCOL
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                    SYNCHRONIZED WITH DIGITAL YOU
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed max-w-4xl">
                  {currentConfig.guidance}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-zinc-950 text-emerald-400 border border-zinc-800">
                AI ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3, 4, 5. DETAILED PROTOCOL CARD FOR ACTIVE TIME SLOT */}
        {/* ============================================================ */}
        <div
          id="plan-detail-card"
          className="bg-zinc-900/50 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-zinc-800 mb-8 relative overflow-hidden transition-all duration-500"
          style={{
            borderColor: `${currentConfig.themeColor}33`
          }}
        >
          {/* Top Period Header Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5"
                  style={{ color: currentConfig.themeColor }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {currentConfig.time} WINDOW
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs font-mono text-zinc-400">
                  TACTICAL PROTOCOL ACTIVE
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-light text-white">
                {slotData.title}
              </h3>
              <p className="text-sm text-zinc-300 mt-1 max-w-3xl font-light">
                {slotData.summary}
              </p>
            </div>

            {/* Quick Telemetry Indicators for the Active Window */}
            <div className="flex items-center gap-4 bg-zinc-950/90 p-3.5 rounded-2xl border border-zinc-800 font-mono text-xs shadow-inner">
              <div className="text-center px-2">
                <span className="text-zinc-500 block text-[10px]">Predicted AQI</span>
                <span className="text-emerald-400 font-bold text-lg">{slotData.aqi}</span>
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div className="text-center px-2">
                <span className="text-zinc-500 block text-[10px]">Temperature</span>
                <span className="text-orange-300 font-bold text-lg">{formatTemp(slotData.temp)}</span>
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div className="text-center px-2">
                <span className="text-zinc-500 block text-[10px]">UV Index</span>
                <span className="text-amber-300 font-bold text-lg">{slotData.uv}</span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 7. FOUR ACTIONABLE RECOMMENDATION PILLARS */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pillar 1: Outdoor Exertion */}
            {(() => {
              const actionKey = `${activeSlot}-0`;
              const isDone = Boolean(completedActions[actionKey]);

              return (
                <div
                  className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden ${
                    isDone
                      ? 'bg-zinc-950/95 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'bg-zinc-950/80 border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Footprints className="w-4 h-4" />
                        <span className="text-xs font-semibold text-zinc-200 uppercase font-mono tracking-wider">
                          Outdoor Exertion
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          slotData.activityRating === 'Recommended'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : slotData.activityRating === 'Caution'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {slotData.activityRating}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-white">
                      {slotData.activityRating === 'Recommended' ? 'Ideal outdoor training window' : 'Limit cardio outdoors'}
                    </p>

                    <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                      {userProfile.healthCondition === 'asthma'
                        ? 'Keep bronchodilator on person; avoid strenuous windward running.'
                        : 'Standard aerobic conditioning safe within designated interval.'}
                    </p>
                  </div>

                  {/* Mark as Completed Button */}
                  <button
                    onClick={() => toggleActionCompleted(actionKey)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-400 stroke-[3]' : 'text-zinc-500'}`} />
                    <span>{isDone ? 'Action Completed ✓' : 'Mark as completed'}</span>
                  </button>
                </div>
              );
            })()}

            {/* Pillar 2: Airflow & Windows */}
            {(() => {
              const actionKey = `${activeSlot}-1`;
              const isDone = Boolean(completedActions[actionKey]);

              return (
                <div
                  className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden ${
                    isDone
                      ? 'bg-zinc-950/95 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'bg-zinc-950/80 border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sky-400">
                        <Home className="w-4 h-4" />
                        <span className="text-xs font-semibold text-zinc-200 uppercase font-mono tracking-wider">
                          Airflow & Windows
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        Ventilation
                      </span>
                    </div>

                    <p className="text-xs font-medium text-white">
                      {slotData.ventilation}
                    </p>

                    <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                      Maintains optimal indoor CO2 levels while intercepting transient outdoor particulate spikes.
                    </p>
                  </div>

                  {/* Mark as Completed Button */}
                  <button
                    onClick={() => toggleActionCompleted(actionKey)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-400 stroke-[3]' : 'text-zinc-500'}`} />
                    <span>{isDone ? 'Action Completed ✓' : 'Mark as completed'}</span>
                  </button>
                </div>
              );
            })()}

            {/* Pillar 3: Respiratory Mask */}
            {(() => {
              const actionKey = `${activeSlot}-2`;
              const isDone = Boolean(completedActions[actionKey]);

              return (
                <div
                  className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden ${
                    isDone
                      ? 'bg-zinc-950/95 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'bg-zinc-950/80 border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-semibold text-zinc-200 uppercase font-mono tracking-wider">
                          Respiratory Mask
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          slotData.maskAdvised
                            ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {slotData.maskAdvised ? 'Advised' : 'Optional'}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-white">
                      {slotData.maskType || (slotData.maskAdvised ? 'N95 / FFP2 Respirator' : 'Unrestricted Breathing')}
                    </p>

                    <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                      Micro-filtration shields bronchial epithelium against PM2.5 deposition and ambient ozone.
                    </p>
                  </div>

                  {/* Mark as Completed Button */}
                  <button
                    onClick={() => toggleActionCompleted(actionKey)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-400 stroke-[3]' : 'text-zinc-500'}`} />
                    <span>{isDone ? 'Action Completed ✓' : 'Mark as completed'}</span>
                  </button>
                </div>
              );
            })()}

            {/* Pillar 4: Biological Action */}
            {(() => {
              const actionKey = `${activeSlot}-3`;
              const isDone = Boolean(completedActions[actionKey]);

              return (
                <div
                  className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden ${
                    isDone
                      ? 'bg-zinc-950/95 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'bg-zinc-950/80 border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-semibold text-zinc-200 uppercase font-mono tracking-wider">
                          Targeted Action
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Physiological
                      </span>
                    </div>

                    <p className="text-xs font-medium text-amber-200">
                      {slotData.keyAction}
                    </p>

                    <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                      Counteracts diurnal mucosal dehydration and neutralizes systemic oxidative stressors.
                    </p>
                  </div>

                  {/* Mark as Completed Button */}
                  <button
                    onClick={() => toggleActionCompleted(actionKey)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-400 stroke-[3]' : 'text-zinc-500'}`} />
                    <span>{isDone ? 'Action Completed ✓' : 'Mark as completed'}</span>
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 10. ACTION TRANSITION TO 07 TRENDS */}
        {/* ============================================================ */}
        <div className="relative pt-2 flex flex-col items-center text-center">
          {/* Animated signal conduit moving toward Section 07 */}
          <div className="w-[2px] h-12 bg-gradient-to-b from-emerald-400 via-sky-400 to-transparent relative mb-3 overflow-hidden">
            <div className="w-full h-4 bg-white rounded-full animate-bio-synth-stream-1 shadow-[0_0_8px_#ffffff]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold uppercase tracking-wider">
              TODAY&apos;S PLAN ACTIVE
            </span>
          </div>

          <h4 className="text-sm font-mono text-white tracking-wide mb-1">
            EXPLORE YOUR ENVIRONMENTAL PATTERNS →
          </h4>
          <p className="text-xs text-zinc-400 max-w-md font-light mb-4">
            Compare today&apos;s diurnal schedule against 24-hour predictive models and 7-day cyclical atmospheric trends.
          </p>

          <button
            id="plan-to-trends-cta"
            onClick={onScrollToNext}
            className="px-8 py-3.5 bg-white text-black hover:bg-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(52,211,153,0.5)] transform hover:scale-105"
          >
            <span>Proceed to 07 Environmental Trends</span>
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </section>
  );
};


import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Heart,
  Briefcase,
  Sun,
  Shield,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Baby,
  UserCheck,
  Award,
  Stethoscope,
  Building,
  HardHat,
  GraduationCap,
  Activity,
  Sliders,
  Radio,
  ArrowRight,
  Zap,
  Fingerprint,
  Wind
} from 'lucide-react';
import {
  UserProfile,
  AgeGroup,
  HealthCondition,
  Lifestyle,
  OutdoorExposure
} from '../types';
import { DigitalYouAvatar } from './DigitalYouAvatar';

interface ProfileSectionProps {
  userProfile: UserProfile;
  onChangeProfile: (profile: UserProfile) => void;
  onScrollToNext: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  userProfile,
  onChangeProfile,
  onScrollToNext,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeSignal, setActiveSignal] = useState<{
    type: string;
    label: string;
    timestamp: number;
  } | null>(null);
  const [completionTriggerCount, setCompletionTriggerCount] = useState(0);
  const [activeStepTab, setActiveStepTab] = useState<'all' | 'demographics' | 'health' | 'lifestyle' | 'exposure'>('all');
  const [signalBeamActive, setSignalBeamActive] = useState(false);

  // Detect section entry to trigger futuristic digital scanning effect
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
        } else {
          setHasEntered(false);
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

  // Dispatch signal confirmation with auto-clear timer
  const emitSignal = (type: string, label: string) => {
    setActiveSignal({ type, label, timestamp: Date.now() });
    setSignalBeamActive(true);
    setTimeout(() => {
      setSignalBeamActive(false);
    }, 900);
  };

  const handleUpdate = <K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K],
    signalMsg?: string
  ) => {
    onChangeProfile({
      ...userProfile,
      [key]: value,
    });

    // Provide tailored confirmation message per user interaction
    if (key === 'ageGroup') {
      emitSignal('DEMOGRAPHIC', 'DEMOGRAPHIC SIGNAL SYNCHRONIZED ✓');
    } else if (key === 'healthCondition') {
      emitSignal('SENSITIVITY', 'BIOLOGICAL VULNERABILITY UPDATED');
    } else if (key === 'outdoorExposure') {
      emitSignal('EXPOSURE', 'EXPOSURE SPECTRUM CALIBRATED ✓');
    } else {
      emitSignal('SIGNAL', signalMsg || 'SIGNAL CAPTURED ✓');
    }
  };

  // Trigger completion moment
  const triggerCompletion = () => {
    setCompletionTriggerCount((prev) => prev + 1);
    emitSignal('COMPLETION', 'DIGITAL YOU READY ✓');
  };

  // Presets for quick archetypes
  const presets = [
    {
      name: 'Asthmatic Student',
      tag: 'Airway Sensitive',
      profile: {
        ageGroup: 'child' as AgeGroup,
        healthCondition: 'asthma' as HealthCondition,
        lifestyle: 'student' as Lifestyle,
        outdoorExposure: 'medium' as OutdoorExposure,
      }
    },
    {
      name: 'Urban Office Worker',
      tag: 'Low Exposure',
      profile: {
        ageGroup: 'adult' as AgeGroup,
        healthCondition: 'healthy' as HealthCondition,
        lifestyle: 'office_worker' as Lifestyle,
        outdoorExposure: 'low' as OutdoorExposure,
      }
    },
    {
      name: 'Cardiac Senior',
      tag: 'Vascular Sensitive',
      profile: {
        ageGroup: 'senior' as AgeGroup,
        healthCondition: 'heart_condition' as HealthCondition,
        lifestyle: 'office_worker' as Lifestyle,
        outdoorExposure: 'medium' as OutdoorExposure,
      }
    },
    {
      name: 'Outdoor Field Worker',
      tag: 'High Exposure',
      profile: {
        ageGroup: 'adult' as AgeGroup,
        healthCondition: 'healthy' as HealthCondition,
        lifestyle: 'outdoor_worker' as Lifestyle,
        outdoorExposure: 'high' as OutdoorExposure,
      }
    }
  ];

  // Calculate profile completion score (4 signals active)
  const isCompleted = Boolean(
    userProfile.ageGroup &&
    userProfile.healthCondition &&
    userProfile.lifestyle &&
    userProfile.outdoorExposure
  );

  return (
    <section
      ref={sectionRef}
      id="profile"
      className="relative min-h-screen w-full flex flex-col justify-center px-4 sm:px-8 py-24 earth-section-muted text-zinc-100 overflow-hidden"
    >
      {/* Subtle backdrop glowing ambient auras */}
      <div className="absolute top-1/4 left-1/4 w-[550px] h-[550px] bg-[#FF5C4D]/[0.035] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[550px] h-[550px] bg-[#8EDCFF]/[0.025] rounded-full blur-[160px] pointer-events-none" />

      {/* Holographic Entry Scan line that sweeps down the whole section when user scrolls in */}
      <div
        className={`absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF5C4D]/60 to-transparent pointer-events-none z-30 transition-all duration-1000 ${
          hasEntered ? 'top-full opacity-0' : 'top-0 opacity-80'
        }`}
        style={{ transitionDuration: '2.4s', filter: 'drop-shadow(0 0 5px #FF5C4D)' }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 story-kicker mb-3">
              <Fingerprint className="w-3.5 h-3.5 text-[#FF5C4D]" />
              <span>Bio-Calibration 03 // Digital You</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-light tracking-tight flex items-center gap-3">
              <span>Calibrate Your Digital You</span>
              <span className="hidden sm:inline-block text-xs font-mono px-2.5 py-1 rounded-md bg-[#FF5C4D]/10 border border-[#FF5C4D]/30 text-[#FF5C4D]">
                LIVE BIO-TWIN
              </span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
              Atmospheric toxins target different biological pathways. AeroCare captures your demographic, sensitivity, and exposure signals in real time to synthesize a personalized defense model.
            </p>
          </div>

          {/* Quick Archetype Switcher */}
          <div className="flex flex-col items-start md:items-end gap-1.5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
              <Sparkles className="w-3 h-3 text-[#F6B73C]" />
              <span>Quick Archetypes</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => {
                const isActive =
                  userProfile.ageGroup === preset.profile.ageGroup &&
                  userProfile.healthCondition === preset.profile.healthCondition &&
                  userProfile.lifestyle === preset.profile.lifestyle &&
                  userProfile.outdoorExposure === preset.profile.outdoorExposure;

                return (
                  <button
                    key={preset.name}
                    id={`preset-${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => {
                      onChangeProfile(preset.profile);
                      emitSignal('ARCHETYPE', `ARCHETYPE LOADED: ${preset.name.toUpperCase()} ✓`);
                      setCompletionTriggerCount((p) => p + 1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-[#FF5C4D]/15 text-[#FF5C4D] border-[#FF5C4D]/40 scale-[1.02]'
                        : 'bg-zinc-900/30 text-zinc-400 border-white/[0.08] hover:border-[#FF5C4D]/30 hover:text-zinc-200'
                    }`}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real-Time Calibration Status & Completion HUD Banner */}
        <div
          id="profile-completion-hud"
          className={`mb-8 p-4 sm:p-5 rounded-2xl border transition-all duration-700 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl ${
            isCompleted
              ? 'bg-[#151326] border-[#63D9B3]/40 shadow-[0_0_30px_rgba(99,217,179,0.15)]'
              : 'bg-zinc-900/50 border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${
                isCompleted
                  ? 'bg-[#63D9B3]/20 border-[#63D9B3]/40 text-[#63D9B3] shadow-[0_0_16px_rgba(99,217,179,0.35)]'
                  : 'bg-zinc-800/80 border-zinc-700 text-zinc-400'
              }`}
            >
              <Radio className="w-5 h-5 animate-pulse text-[#63D9B3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#63D9B3]">
                  Bio Profile Synchronization
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  4/4 SIGNALS ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {/* Visual Progress indicator: ████████████████████ 100% */}
                <div className="flex items-center font-mono text-xs text-[#63D9B3] tracking-tighter select-none font-bold">
                  <span>[</span>
                  <span className="text-[#63D9B3] animate-pulse">████████████████████</span>
                  <span>]</span>
                </div>
                <span className="text-xs font-mono text-[#63D9B3] font-bold">100%</span>
                <span className="text-xs font-mono text-zinc-400 hidden sm:inline">•</span>
                <span className="text-xs font-mono text-[#63D9B3] font-semibold hidden sm:inline">
                  DIGITAL YOU READY ✓
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {activeSignal && (
              <div className="px-3 py-1.5 rounded-full bg-[#63D9B3]/20 border border-[#63D9B3]/40 text-[#63D9B3] text-xs font-mono flex items-center gap-2 animate-pulse shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#63D9B3]" />
                <span className="font-bold">{activeSignal.label}</span>
              </div>
            )}
            <button
              id="resync-digital-you-btn"
              onClick={triggerCompletion}
              className="px-4 py-2 rounded-xl bg-zinc-800/80 hover:bg-[#FF5C4D]/20 hover:border-[#FF5C4D]/40 border border-zinc-700 text-xs font-mono text-zinc-200 hover:text-[#FF5C4D] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#FF5C4D]" />
              <span>Sync Signals</span>
            </button>
          </div>
        </div>

        {/* Main Interactive Grid: 7 Cols Controls + 5 Cols Holographic Avatar Pod */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10 relative">
          {/* Signal beam trajectory effect overlay */}
          {signalBeamActive && (
            <div className="hidden lg:block absolute left-[56%] top-1/3 w-28 h-[2px] bg-gradient-to-r from-[#FF5C4D] via-[#8EDCFF] to-transparent z-40 pointer-events-none animate-bio-packet-flow" />
          )}

          {/* Left Column (7 cols): Step-by-Step Bio-Signal Calibration Controls */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Dimension 1: Demographic Cohort (Age Group) */}
            <div
              id="profile-age-group-block"
              className="bg-zinc-900/40 rounded-2xl p-6 border border-zinc-800 relative overflow-hidden backdrop-blur-xl group hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#8EDCFF]/10 border border-[#8EDCFF]/20 flex items-center justify-center text-[#8EDCFF]">
                    <Baby className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-white flex items-center gap-2">
                      <span>1. Demographic Cohort</span>
                      <span className="text-[10px] font-mono text-zinc-500 font-normal">[SIGNAL 01]</span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-light">Physiological lung volume, airway caliber & cellular turnover</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#8EDCFF] bg-[#8EDCFF]/10 px-2.5 py-1 rounded-full border border-[#8EDCFF]/20 capitalize font-bold">
                  {userProfile.ageGroup}
                </span>
              </div>

              {/* Demographic Interactive Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'child' as AgeGroup,
                    label: 'Child',
                    sub: '< 18 years',
                    desc: 'Higher respiratory rate per kg body mass; immature alveolar filtration matrix.',
                    icon: Baby
                  },
                  {
                    id: 'adult' as AgeGroup,
                    label: 'Adult',
                    sub: '18 – 64 years',
                    desc: 'Fully developed airway surface area; baseline standard clearance rate.',
                    icon: UserCheck
                  },
                  {
                    id: 'senior' as AgeGroup,
                    label: 'Senior',
                    sub: '65+ years',
                    desc: 'Reduced alveolar elasticity and microvascular clearance rate under particulate load.',
                    icon: Award
                  }
                ].map((item) => {
                  const isSelected = userProfile.ageGroup === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      id={`profile-age-${item.id}`}
                      onClick={() => handleUpdate('ageGroup', item.id)}
                      className={`p-4 rounded-xl text-left border transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden transform ${
                        isSelected
                          ? 'bg-[#FF5C4D]/10 border-[#FF5C4D] text-[#FF5C4D] ring-2 ring-[#FF5C4D]/30 shadow-[0_0_24px_rgba(255,92,77,0.25)] scale-[1.03] z-10'
                          : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 opacity-60 hover:opacity-100 hover:border-zinc-700 hover:bg-zinc-900/60'
                      }`}
                    >
                      {/* Subtly animated active glow pulse on selected card */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5C4D]/10 via-transparent to-transparent pointer-events-none" />
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 transition-colors ${isSelected ? 'text-[#FF5C4D]' : 'text-zinc-500'}`} />
                          {isSelected ? (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-[#FF5C4D] font-bold bg-[#FF5C4D]/20 px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              SYNCED
                            </span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-zinc-800" />
                          )}
                        </div>
                        <span className="font-semibold text-sm text-white block">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono block mb-2">
                          {item.sub}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-light leading-snug">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Status indicator ribbon */}
              <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>SELECTION TRAJECTORY: BIOMETRIC AVATAR</span>
                <span className="text-[#63D9B3] font-semibold">SIGNAL ACTIVE ✓</span>
              </div>
            </div>

            {/* Dimension 2: Biological Vulnerability / Condition */}
            <div
              id="profile-health-condition-block"
              className="bg-zinc-900/40 rounded-2xl p-6 border border-zinc-800 relative overflow-hidden backdrop-blur-xl group hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-white flex items-center gap-2">
                      <span>2. Biological Sensitivity & Target Organ</span>
                      <span className="text-[10px] font-mono text-zinc-500 font-normal">[SIGNAL 02]</span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-light">Subtly highlights corresponding anatomical region in your Digital You</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 capitalize font-bold">
                  {userProfile.healthCondition.replace('_', ' ')}
                </span>
              </div>

              {/* Sensitivity Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'healthy' as HealthCondition,
                    label: 'Healthy Baseline',
                    sub: 'Full-Body Shield',
                    desc: 'Intact cilia and robust pulmonary macrophage defense. Balanced cellular equilibrium.',
                    icon: Shield,
                    accent: 'mint',
                    organLabel: 'Systemic Shield'
                  },
                  {
                    id: 'asthma' as HealthCondition,
                    label: 'Asthma / Airway',
                    sub: 'Bronchial Reactive',
                    desc: 'Hyper-reactive bronchospasms triggered by particulate deposition. Chest highlighted.',
                    icon: Stethoscope,
                    accent: 'sky',
                    organLabel: 'Lungs & Alveoli'
                  },
                  {
                    id: 'heart_condition' as HealthCondition,
                    label: 'Heart Condition',
                    sub: 'Cardiovascular Load',
                    desc: 'Particulates trigger arterial vasoconstriction & arrhythmic load. Cardiac center highlighted.',
                    icon: Heart,
                    accent: 'rose',
                    organLabel: 'Cardiovascular'
                  }
                ].map((item) => {
                  const isSelected = userProfile.healthCondition === item.id;
                  const Icon = item.icon;

                  const colorStyles = {
                    mint: isSelected
                      ? 'bg-[#63D9B3]/10 border-[#63D9B3] text-[#63D9B3] ring-2 ring-[#63D9B3]/30 shadow-[0_0_24px_rgba(99,217,179,0.25)]'
                      : 'border-zinc-800/80',
                    sky: isSelected
                      ? 'bg-sky-500/10 border-sky-400 text-sky-200 ring-2 ring-sky-500/30 shadow-[0_0_24px_rgba(56,189,248,0.25)]'
                      : 'border-zinc-800/80',
                    rose: isSelected
                      ? 'bg-rose-500/10 border-rose-400 text-rose-200 ring-2 ring-rose-500/30 shadow-[0_0_24px_rgba(244,63,94,0.25)]'
                      : 'border-zinc-800/80',
                  }[item.accent];

                  return (
                    <button
                      key={item.id}
                      id={`profile-condition-${item.id}`}
                      onClick={() => handleUpdate('healthCondition', item.id)}
                      className={`p-4 rounded-xl text-left border transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden transform ${
                        isSelected
                          ? `${colorStyles} scale-[1.03] z-10`
                          : 'bg-zinc-950/60 text-zinc-400 opacity-60 hover:opacity-100 hover:border-zinc-700 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Icon
                            className={`w-5 h-5 transition-colors ${
                              isSelected
                                ? item.accent === 'rose'
                                  ? 'text-rose-400'
                                  : item.accent === 'sky'
                                  ? 'text-sky-400'
                                  : 'text-[#63D9B3]'
                                : 'text-zinc-500'
                            }`}
                          />
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                              isSelected
                                ? 'bg-zinc-800 text-white'
                                : 'text-zinc-500 bg-zinc-900'
                            }`}
                          >
                            {item.organLabel}
                          </span>
                        </div>
                        <span className="font-semibold text-sm text-white block">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono block mb-2">
                          {item.sub}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-light leading-snug">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Status indicator ribbon */}
              <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500">ANATOMICAL TARGET: DIGITAL YOU</span>
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-pulse" />
                  BIOLOGICAL VULNERABILITY UPDATED
                </span>
              </div>
            </div>

            {/* Dimension 3: Lifestyle & Shielding Environment */}
            <div
              id="profile-lifestyle-block"
              className="bg-zinc-900/40 rounded-2xl p-6 border border-zinc-800 relative overflow-hidden backdrop-blur-xl group hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-white flex items-center gap-2">
                      <span>3. Micro-Environment & Routine</span>
                      <span className="text-[10px] font-mono text-zinc-500 font-normal">[SIGNAL 03]</span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-light">Built-environment filtration, HVAC air recirculation, and commute transit spikes</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 capitalize font-bold">
                  {userProfile.lifestyle.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'student' as Lifestyle,
                    label: 'Student',
                    sub: 'Campus & Transit',
                    desc: 'Frequent transition between classrooms, corridors, and outdoor paths.',
                    icon: GraduationCap
                  },
                  {
                    id: 'office_worker' as Lifestyle,
                    label: 'Office Worker',
                    sub: 'Indoor Controlled',
                    desc: 'Extended periods in HVAC-filtered environments; peak commute spikes.',
                    icon: Building
                  },
                  {
                    id: 'outdoor_worker' as Lifestyle,
                    label: 'Outdoor Worker',
                    sub: 'High Ambient Influx',
                    desc: 'Continuous direct ambient air respiration without physical filtration.',
                    icon: HardHat
                  }
                ].map((item) => {
                  const isSelected = userProfile.lifestyle === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      id={`profile-lifestyle-${item.id}`}
                      onClick={() => handleUpdate('lifestyle', item.id)}
                      className={`p-4 rounded-xl text-left border transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden transform ${
                        isSelected
                          ? 'bg-sky-500/10 border-sky-400 text-sky-200 ring-2 ring-sky-500/30 shadow-[0_0_24px_rgba(56,189,248,0.25)] scale-[1.03] z-10'
                          : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 opacity-60 hover:opacity-100 hover:border-zinc-700 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 transition-colors ${isSelected ? 'text-sky-400' : 'text-zinc-500'}`} />
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                        </div>
                        <span className="font-semibold text-sm text-white block">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono block mb-2">
                          {item.sub}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-light leading-snug">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dimension 4: Daily Environmental Exposure Spectrum */}
            <div
              id="profile-exposure-block"
              className="bg-zinc-900/40 rounded-2xl p-6 border border-zinc-800 relative overflow-hidden backdrop-blur-xl group hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-white flex items-center gap-2">
                      <span>4. Daily Environmental Exposure Spectrum</span>
                      <span className="text-[10px] font-mono text-zinc-500 font-normal">[SIGNAL 04]</span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-light">Controls ambient aerosol & particulate density streaming around your Digital You</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 capitalize font-bold">
                  {userProfile.outdoorExposure} Exposure
                </span>
              </div>

              {/* Futuristic Interactive Spectrum Bar */}
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 mb-4">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-3 font-semibold">
                  <span className="flex items-center gap-1.5 text-[#63D9B3]">
                    <Shield className="w-3.5 h-3.5" />
                    INDOOR (SHIELDED)
                  </span>
                  <span className="text-zinc-500 text-[10px] tracking-widest uppercase">
                    ← EXPOSURE SPECTRUM →
                  </span>
                  <span className="flex items-center gap-1.5 text-orange-400">
                    <Wind className="w-3.5 h-3.5" />
                    OUTDOOR (EXPOSED)
                  </span>
                </div>

                {/* Visual Spectrum Track with clickable interactive nodes */}
                <div className="relative h-6 flex items-center my-2">
                  <div className="absolute inset-x-0 h-2 rounded-full bg-gradient-to-r from-[#63D9B3] via-[#8EDCFF] to-[#FF5C4D] opacity-60" />
                  
                  {/* Glowing scrub indicator positioned by current selection */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 shadow-[0_0_16px_rgba(255,255,255,0.8)] transition-all duration-300 pointer-events-none ${
                      userProfile.outdoorExposure === 'low'
                        ? 'left-0 border-[#63D9B3] bg-[#63D9B3]/20 shadow-[0_0_16px_#63D9B3]'
                        : userProfile.outdoorExposure === 'medium'
                        ? 'left-1/2 -translate-x-1/2 border-sky-400 bg-sky-100 shadow-[0_0_16px_#38bdf8]'
                        : 'left-full -translate-x-full border-[#FF5C4D] bg-[#FF5C4D]/20 shadow-[0_0_16px_#FF5C4D]'
                    }`}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>Filtered HVAC (&lt;1h)</span>
                  <span>Hybrid Transit (1-4h)</span>
                  <span>Active Field / Shift (4h+)</span>
                </div>
              </div>

              {/* Exposure 3-Option Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'low' as OutdoorExposure,
                    label: 'Indoor Shielded',
                    sub: '< 1 Hour / Day',
                    desc: 'Calm particle perimeter. Reduced aerosol deposition rate.',
                    dosage: 'Dosage: Minimal (22% Baseline)',
                    badgeColor: 'text-[#63D9B3]'
                  },
                  {
                    id: 'medium' as OutdoorExposure,
                    label: 'Moderate Hybrid',
                    sub: '1 – 4 Hours / Day',
                    desc: 'Balanced drift. Regular walking routes, outdoor lunch breaks.',
                    dosage: 'Dosage: Moderate (58% Ambient)',
                    badgeColor: 'text-sky-400'
                  },
                  {
                    id: 'high' as OutdoorExposure,
                    label: 'High Ambient Flux',
                    sub: '4+ Hours / Day',
                    desc: 'Intense particulate stream flowing continuously toward silhouette.',
                    dosage: 'Dosage: Intensive (94% Cumulative)',
                    badgeColor: 'text-orange-400'
                  }
                ].map((item) => {
                  const isSelected = userProfile.outdoorExposure === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`profile-exposure-${item.id}`}
                      onClick={() => handleUpdate('outdoorExposure', item.id)}
                      className={`p-4 rounded-xl text-left border transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden transform ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-400 text-amber-200 ring-2 ring-amber-500/30 shadow-[0_0_24px_rgba(245,158,11,0.25)] scale-[1.03] z-10'
                          : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 opacity-60 hover:opacity-100 hover:border-zinc-700 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-mono font-bold ${item.badgeColor}`}>
                            {item.dosage}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </div>
                        <span className="font-semibold text-sm text-white block">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono block mb-2">
                          {item.sub}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-light leading-snug">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Status indicator ribbon */}
              <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>AVATAR PARTICLE FLUX: REAL-TIME LINKED</span>
                <span className="text-amber-400 font-semibold">FLOW SPEED: {userProfile.outdoorExposure.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Live Digital You Holographic Pod */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="flex flex-col gap-3">
              {/* Digital You Avatar Holographic Pod */}
              <DigitalYouAvatar
                userProfile={userProfile}
                hasEntered={hasEntered}
                recentSignal={activeSignal}
                isCompleted={isCompleted}
                completionTriggerCount={completionTriggerCount}
              />

              {/* Live Biometric Telemetry Summary Card */}
              <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800 text-xs font-mono text-zinc-400 flex flex-col gap-2">
                <div className="flex items-center justify-between text-zinc-300 font-semibold border-b border-zinc-800/60 pb-2">
                  <span className="text-[11px] uppercase tracking-wider text-[#8EDCFF] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Biometric Telemetry Checksum
                  </span>
                  <span className="text-[10px] text-zinc-500">SYNC: OPTIMAL</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Cohort / Airway</span>
                    <span className="text-white capitalize">{userProfile.ageGroup} Calibrated</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Pathology Sensitivity</span>
                    <span className="text-white capitalize">{userProfile.healthCondition.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Transit Shielding</span>
                    <span className="text-white capitalize">{userProfile.lifestyle.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Ambient Dosage</span>
                    <span className="text-white capitalize">{userProfile.outdoorExposure} Exposure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 8. PREPARE FOR AI SYNTHESIS (Bottom Conduit) */}
        {/* ============================================================ */}
        <div
          id="profile-to-analysis-conduit"
          className="relative bg-zinc-900/60 rounded-2xl p-6 sm:p-8 border border-zinc-800 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-2xl"
        >
          {/* Animated data particles / signal lines streaming downward toward AI Synthesis section */}
          <div className="absolute inset-x-0 bottom-0 h-14 pointer-events-none overflow-hidden opacity-40">
            <div className="absolute left-[15%] w-[1.5px] h-full bg-gradient-to-b from-[#FF5C4D] to-transparent animate-bio-synth-stream-1" />
            <div className="absolute left-[35%] w-[2px] h-full bg-gradient-to-b from-[#8EDCFF] to-transparent animate-bio-synth-stream-2" />
            <div className="absolute left-[55%] w-[1.5px] h-full bg-gradient-to-b from-[#FF5C4D] to-transparent animate-bio-synth-stream-3" />
            <div className="absolute left-[75%] w-[2px] h-full bg-gradient-to-b from-[#F6B73C] to-transparent animate-bio-synth-stream-1" />
            <div className="absolute left-[90%] w-[1.5px] h-full bg-gradient-to-b from-[#8EDCFF] to-transparent animate-bio-synth-stream-2" />
          </div>

          <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5C4D]/15 border border-[#FF5C4D]/30 flex items-center justify-center text-[#FF5C4D] shadow-[0_0_20px_rgba(255,92,77,0.25)] shrink-0">
              <Sparkles className="w-6 h-6 text-[#FF5C4D] animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-white text-base">
                  Bio-Profile Synthesized &amp; Ready
                </p>
                <span className="text-[10px] bg-[#63D9B3]/20 text-[#63D9B3] font-mono font-bold px-2.5 py-0.5 rounded-full border border-[#63D9B3]/40">
                  DIGITAL YOU READY ✓
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 font-light flex items-center gap-1.5">
                <span className="text-[#FF5C4D] font-mono font-semibold">
                  PROFILE DATA READY FOR AI SYNTHESIS →
                </span>
                <span className="hidden sm:inline text-zinc-500">
                  Cross-referencing real-time atmospheric readings with your Digital You parameters.
                </span>
              </p>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
            <button
              id="profile-to-analysis-btn"
              onClick={onScrollToNext}
              className="w-full sm:w-auto px-7 py-3.5 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#FF5C4D] hover:text-white hover:shadow-[0_0_30px_rgba(255,92,77,0.5)] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <span>Run AI Cross-Analysis</span>
              <ChevronRight className="w-4 h-4 text-black group-hover:text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

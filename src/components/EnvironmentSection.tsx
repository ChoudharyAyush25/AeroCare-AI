import React, { useState, useEffect, useRef } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Gauge,
  Info,
  ChevronRight,
  Shield,
  Layers,
  CloudSun
} from 'lucide-react';
import { EnvironmentalData } from '../types';
import { CITIES } from '../data/mockData';

interface EnvironmentSectionProps {
  currentCity: EnvironmentalData;
  onSelectCity: (city: EnvironmentalData) => void;
  isCelsius: boolean;
  onToggleTempUnit: () => void;
  onScrollToNext: () => void;
  isLoadingTelemetry?: boolean;
}

export const EnvironmentSection: React.FC<EnvironmentSectionProps> = ({
  currentCity,
  onSelectCity,
  isCelsius,
  onToggleTempUnit,
  onScrollToNext,
  isLoadingTelemetry,
}) => {
  const [showPollutantDetails, setShowPollutantDetails] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [animatedAqi, setAnimatedAqi] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Trigger choreographed entrance every time the Atmosphere section becomes visible
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
        } else {
          // Reset so entering the section replays the entrance and AQI gauge animations
          setHasEntered(false);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -5% 0px',
      }
    );

    observer.observe(el);

    // Initial check in case Atmosphere section is in viewport on page load
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
      setHasEntered(true);
    }

    return () => observer.disconnect();
  }, []);

  // Smooth count-up animation for the circular AQI gauge and numeric readout every time section is visible
  useEffect(() => {
    if (!hasEntered) {
      setAnimatedAqi(0);
      return;
    }

    const targetAqi = currentCity.aqi;
    const startTime = performance.now();
    const duration = 1400; // 1.4s smooth visible sweep

    let rafId: number;
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Quintic ease-out curve for smooth decelerating cinematic count-up
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setAnimatedAqi(Math.round(easeProgress * targetAqi));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [hasEntered, currentCity.aqi]);

  // Ambient atmospheric micro-particles background canvas simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    interface AtmosphericParticle {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
      baseOpacity: number;
    }

    const particles: AtmosphericParticle[] = Array.from({ length: 10 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.6,
      speedY: -(Math.random() * 0.35 + 0.15),
      speedX: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.3 + 0.1,
      baseOpacity: Math.random() * 0.3 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${p.opacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const formatTemp = (celsius: number) => {
    return isCelsius
      ? `${celsius}°C`
      : `${Math.round((celsius * 9) / 5 + 32)}°F`;
  };

  // Color mappings for AQI
  const getAqiTheme = (aqi: number) => {
    if (aqi <= 50) {
      return {
        stroke: '#63D9B3',
        glow: 'rgba(99, 217, 179, 0.25)',
        text: 'text-[#63D9B3]',
        bg: 'bg-[#63D9B3]/10 border-[#63D9B3]/30',
        label: 'Good Air Quality'
      };
    }
    if (aqi <= 100) {
      return {
        stroke: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.25)',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        label: 'Moderate Air Quality'
      };
    }
    if (aqi <= 150) {
      return {
        stroke: '#f97316',
        glow: 'rgba(249, 115, 22, 0.25)',
        text: 'text-orange-400',
        bg: 'bg-orange-500/10 border-orange-500/30',
        label: 'Unhealthy for Sensitive Groups'
      };
    }
    return {
      stroke: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.25)',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
      label: 'Unhealthy Air Quality'
    };
  };

  const aqiTheme = getAqiTheme(currentCity.aqi);

  // SVG Gauge calculations
  const radius = 64;
  const arcLength = 2 * Math.PI * radius * 0.75; // 301.59px (270-degree arc)
  const circumference = 2 * Math.PI * radius; // 402.12px
  // Real-time animated stroke offset tied directly to animatedAqi count-up
  const progressRatio = Math.min(1, Math.max(0, animatedAqi / 300));
  const activeStrokeOffset = arcLength * (1 - progressRatio);

  return (
    <section
      ref={sectionRef}
      id="environment"
      className="relative min-h-screen w-full flex flex-col justify-center px-4 sm:px-8 py-24 earth-section-muted text-zinc-100 overflow-hidden"
    >
      {/* Background Living Weather Atmosphere */}
      {/* 1. Ambient Background Drifting Clouds */}
      <div className="absolute -top-12 left-0 w-[200%] h-80 pointer-events-none opacity-25 animate-cloud-drift-1">
        <svg viewBox="0 0 2000 300" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="envSectionCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#334155" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#050505" stopOpacity="0" />
            </linearGradient>
            <filter id="envCloudSoft">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>
          <path
            d="M0,140 Q250,70 500,120 T1000,90 T1500,130 T2000,80 L2000,300 L0,300 Z"
            fill="url(#envSectionCloudGrad)"
            filter="url(#envCloudSoft)"
          />
        </svg>
      </div>

      {/* 2. Ambient Micro-particles canvas layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60"
      />

      {/* 3. Subtle backdrop ambient glow spots */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-[#FF5C4D]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-[#8EDCFF]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header with smooth entrance reveal */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 transform transition-all duration-700 ease-out ${
            hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-[#FF5C4D] text-xs font-mono uppercase tracking-wider">
                <CloudSun className="w-3.5 h-3.5" />
                <span>Telemetry Matrix 01</span>
              </div>
              {currentCity.isRealTelemetry && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#63D9B3]/10 border border-[#63D9B3]/30 text-[#63D9B3] text-[11px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#63D9B3] animate-pulse" />
                  <span>LIVE // {currentCity.lastUpdated || 'OBSERVED TELEMETRY'}</span>
                </div>
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-light tracking-tight">
              Real-Time Atmospheric Conditions
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
              High-resolution telemetry capturing thermodynamic, solar, and aerosol properties impacting human physiology.
            </p>
          </div>

          {/* Quick City Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            {CITIES.map((c) => {
              const isSelected = c.location === currentCity.location;
              return (
                <button
                  key={c.location}
                  id={`env-city-${c.location.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  onClick={() => onSelectCity(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF5C4D]/15 text-[#FF5C4D] border border-[#FF5C4D]/30 shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  {c.location.split(',')[0]}
                </button>
              );
            })}

            {/* Custom searched or GPS city if not one of the 5 default presets */}
            {!CITIES.some((c) => c.location.split(',')[0].toLowerCase() === currentCity.location.split(',')[0].toLowerCase()) && (
              <button
                id="env-city-custom"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FF5C4D]/15 text-[#FF5C4D] border border-[#FF5C4D]/30 shadow-sm flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C4D] animate-pulse" />
                <span>{currentCity.location.split(',')[0]}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Conditions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-8">
          {/* Main Air Quality Hero Card (5 columns) - Revealed First (0ms delay): Animates upward from below + fades in */}
          <div
            id="env-aqi-card"
            className={`lg:col-span-5 bg-zinc-900/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border border-zinc-800 backdrop-blur-xl group hover:border-zinc-700 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-700 ease-out transform ${
              hasEntered
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                : 'opacity-0 translate-y-28 scale-95 pointer-events-none'
            }`}
            style={{
              transitionDelay: '0ms',
            }}
          >
            {/* Ambient atmospheric haze effect in the background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl opacity-40 group-hover:opacity-85 transition-opacity duration-500">
              <div
                className="absolute -top-16 -left-16 w-80 h-80 rounded-full blur-3xl animate-aqi-haze"
                style={{ backgroundColor: aqiTheme.stroke, opacity: 0.2 }}
              />
              <div
                className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl animate-aqi-haze"
                style={{ backgroundColor: aqiTheme.stroke, opacity: 0.16, animationDelay: '4.5s' }}
              />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                  Primary Biomarker
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Air Quality Index (AQI)
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${aqiTheme.bg} ${aqiTheme.text}`}>
                {currentCity.aqiCategory}
              </span>
            </div>

            {/* Circular AQI Dial Display with Animated Smooth Gauge & Live Pulse */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-6 relative z-10">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-135" viewBox="0 0 160 160">
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${arcLength} ${circumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                  {/* Active Gradient Arc with Smooth Real-time Offset Animation */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={aqiTheme.stroke}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${arcLength} ${circumference}`}
                    strokeDashoffset={activeStrokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-75 ease-out"
                    style={{
                      filter: `drop-shadow(0 0 14px ${aqiTheme.glow})`
                    }}
                  />
                </svg>

                {/* Center Value with Live Telemetry Pulse Ring */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div
                    className="absolute w-20 h-20 rounded-full animate-aqi-telemetry pointer-events-none"
                    style={{ backgroundColor: `${aqiTheme.stroke}15` }}
                  />
                  <span className="text-4xl font-light font-mono text-white tracking-tight relative z-10">
                    {animatedAqi}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-zinc-500 relative z-10">
                    US AQI
                  </span>
                </div>
              </div>

              {/* Status Context Info */}
              <div className="space-y-2 text-left max-w-xs">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[#8EDCFF]" />
                  <span className="text-xs font-semibold text-zinc-200">
                    {aqiTheme.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  Suspended microscopic particulate matter capable of alveolar and capillary bloodstream penetration.
                </p>
                <div className="pt-2 flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">PM2.5</span>
                    <span className="text-[#63D9B3] font-semibold">{currentCity.pollutants.pm25} µg/m³</span>
                  </div>
                  <div className="h-6 w-px bg-zinc-800" />
                  <div>
                    <span className="text-zinc-500 block text-[10px]">PM10</span>
                    <span className="text-zinc-200 font-semibold">{currentCity.pollutants.pm10} µg/m³</span>
                  </div>
                  <div className="h-6 w-px bg-zinc-800" />
                  <div>
                    <span className="text-zinc-500 block text-[10px]">O3</span>
                    <span className="text-zinc-200 font-semibold">{currentCity.pollutants.o3} ppb</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 relative z-10">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#63D9B3] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#63D9B3]" />
                </span>
                <span>{currentCity.lastUpdated}</span>
              </span>
              <button
                onClick={() => setShowPollutantDetails(!showPollutantDetails)}
                className="text-[#8EDCFF] hover:text-white flex items-center gap-1 font-medium cursor-pointer transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showPollutantDetails ? 'Hide Composition' : 'View Breakdown'}</span>
              </button>
            </div>
          </div>

          {/* 4 Core Parameter Cards (7 columns) - Sequentially Staggered Entries */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Temperature Card - Slides in from the LEFT (200ms delay) + Continuous Heat Shimmer / Warm Glow */}
            <div
              id="env-temp-card"
              className={`bg-zinc-900/40 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between hover:border-orange-500/40 hover:-translate-y-1.5 hover:shadow-[0_14px_34px_rgba(249,115,22,0.16)] transition-all duration-700 ease-out group backdrop-blur-xl relative overflow-hidden transform ${
                hasEntered
                  ? 'opacity-100 translate-x-0 pointer-events-auto'
                  : 'opacity-0 -translate-x-28 pointer-events-none'
              }`}
              style={{
                transitionDelay: '200ms',
              }}
            >
              {/* Subtle ambient corner warmth */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl opacity-35 group-hover:opacity-85 transition-opacity duration-500">
                <div className="absolute -bottom-8 -left-8 w-44 h-44 rounded-full bg-gradient-to-tr from-orange-500/20 via-amber-500/10 to-transparent blur-2xl animate-heat-shimmer-glow" />
              </div>

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-sm">
                  <Thermometer className="w-5 h-5 text-orange-400 animate-temp-icon" />
                </div>
                <button
                  onClick={onToggleTempUnit}
                  className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-[#F6B73C] border border-zinc-700 cursor-pointer"
                >
                  Convert Unit
                </button>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Ambient Temperature</span>
                <div className="relative inline-flex items-baseline gap-2 mt-1">
                  {/* Clearly visible animated warm glow and heat shimmer behind the temperature */}
                  <div className="absolute -inset-x-4 -inset-y-3 rounded-2xl bg-gradient-to-r from-orange-500/30 via-amber-500/35 to-rose-500/25 blur-xl animate-heat-shimmer-glow pointer-events-none" />
                  
                  {/* Rising wavy heat shimmer displacement distortion lines */}
                  <svg className="absolute -inset-x-2 -inset-y-3 w-[calc(100%+16px)] h-[calc(100%+24px)] pointer-events-none opacity-80" viewBox="0 0 160 60" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="tempHeatWaveGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.75" />
                        <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 20,55 Q 28,30 22,12 T 26,0" stroke="url(#tempHeatWaveGrad)" strokeWidth="3" fill="none" className="animate-heat-wave-1" />
                    <path d="M 55,55 Q 63,28 57,10 T 61,0" stroke="url(#tempHeatWaveGrad)" strokeWidth="3.5" fill="none" className="animate-heat-wave-2" />
                    <path d="M 90,55 Q 82,32 88,14 T 84,0" stroke="url(#tempHeatWaveGrad)" strokeWidth="3" fill="none" className="animate-heat-wave-3" />
                    <path d="M 125,55 Q 133,30 127,12 T 131,0" stroke="url(#tempHeatWaveGrad)" strokeWidth="2.5" fill="none" className="animate-heat-wave-1" />
                  </svg>

                  <span className="text-3xl sm:text-4xl font-light text-white relative z-10 drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]">
                    {formatTemp(currentCity.temperature)}
                  </span>
                  <span className="text-xs text-zinc-400 font-light relative z-10">
                    Feels like {formatTemp(currentCity.feelsLike)}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 relative z-10">
                <span>Diurnal Range: ±4°C</span>
                <span className="text-[#63D9B3] font-medium">Comfort: Nominal</span>
              </div>
            </div>

            {/* 2. Humidity Card - Slides in from the RIGHT (400ms delay) + Continuous Falling Droplets */}
            <div
              id="env-humidity-card"
              className={`bg-zinc-900/40 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between hover:border-sky-500/40 hover:-translate-y-1.5 hover:shadow-[0_14px_34px_rgba(56,189,248,0.16)] transition-all duration-700 ease-out group backdrop-blur-xl relative overflow-hidden transform ${
                hasEntered
                  ? 'opacity-100 translate-x-0 pointer-events-auto'
                  : 'opacity-0 translate-x-28 pointer-events-none'
              }`}
              style={{
                transitionDelay: '400ms',
              }}
            >
              {/* Visible small water particles/droplets slowly moving downward and looping continuously */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
                {/* Droplet 1 */}
                <div className="absolute top-0 left-[14%] animate-droplet-fall-1">
                  <div className="w-2 h-3.5 rounded-b-full rounded-t-sm bg-gradient-to-b from-sky-200 via-sky-400 to-sky-500 shadow-[0_0_10px_#38bdf8]" />
                </div>
                {/* Droplet 2 */}
                <div className="absolute top-0 left-[30%] animate-droplet-fall-2">
                  <div className="w-1.5 h-3 rounded-b-full rounded-t-sm bg-gradient-to-b from-sky-300 via-sky-400 to-[#8EDCFF] shadow-[0_0_8px_#8EDCFF]" />
                </div>
                {/* Droplet 3 */}
                <div className="absolute top-0 left-[48%] animate-droplet-fall-3">
                  <div className="w-2.5 h-4 rounded-b-full rounded-t-sm bg-gradient-to-b from-[#8EDCFF]/80 via-sky-400 to-sky-600 shadow-[0_0_12px_#8EDCFF]" />
                </div>
                {/* Droplet 4 */}
                <div className="absolute top-0 left-[66%] animate-droplet-fall-4">
                  <div className="w-1.5 h-3 rounded-b-full rounded-t-sm bg-gradient-to-b from-sky-200 via-sky-300 to-sky-500 shadow-[0_0_8px_#7dd3fc]" />
                </div>
                {/* Droplet 5 */}
                <div className="absolute top-0 left-[82%] animate-droplet-fall-5">
                  <div className="w-2 h-3.5 rounded-b-full rounded-t-sm bg-gradient-to-b from-sky-200 via-sky-400 to-sky-500 shadow-[0_0_10px_#38bdf8]" />
                </div>
                {/* Droplet 6 */}
                <div className="absolute top-0 left-[93%] animate-droplet-fall-6">
                  <div className="w-1.5 h-2.5 rounded-b-full rounded-t-sm bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500 shadow-[0_0_8px_#38bdf8]" />
                </div>
                {/* Subtle base moisture glow */}
                <div className="absolute -bottom-6 inset-x-0 h-20 bg-gradient-to-t from-sky-500/15 to-transparent blur-lg" />
              </div>

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shadow-sm">
                  <Droplets className="w-5 h-5 text-sky-400" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-mono text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  {currentCity.humidity > 70 ? 'High Moisture' : 'Balanced'}
                </span>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Relative Humidity</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-light text-white">
                    {currentCity.humidity}%
                  </span>
                  <span className="text-xs text-zinc-400 font-light">
                    Dew Point: 14°C
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 relative z-10">
                <span>Vapor Pressure: 1.8 kPa</span>
                <span className="text-sky-300 font-medium">Hydration: Good</span>
              </div>
            </div>

            {/* 3. Wind Speed Card - Slides upward with slight rotation (600ms delay) + 3 Continuous Flow Lines */}
            <div
              id="env-wind-card"
              className={`bg-zinc-900/40 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between hover:border-[#8EDCFF]/40 hover:-translate-y-1.5 hover:shadow-[0_14px_34px_rgba(142,220,255,0.16)] transition-all duration-700 ease-out group backdrop-blur-xl relative overflow-hidden transform ${
                hasEntered
                  ? 'opacity-100 translate-y-0 rotate-0 pointer-events-auto'
                  : 'opacity-0 translate-y-28 -rotate-6 pointer-events-none'
              }`}
              style={{
                transitionDelay: '600ms',
              }}
            >
              {/* 3 Visible Animated Wind-Flow Lines continuously travelling left to right */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
                {/* Wind Flow Line 1 (Upper) */}
                <div className="absolute top-[28%] left-0 w-full h-[3px]">
                  <div className="w-36 h-full rounded-full bg-gradient-to-r from-transparent via-[#8EDCFF] to-transparent shadow-[0_0_12px_#8EDCFF] animate-wind-flow-fast" />
                </div>
                {/* Wind Flow Line 2 (Middle) */}
                <div className="absolute top-[52%] left-0 w-full h-[3.5px]">
                  <div className="w-48 h-full rounded-full bg-gradient-to-r from-transparent via-[#F6B73C] to-transparent shadow-[0_0_14px_#F6B73C] animate-wind-flow-med" />
                </div>
                {/* Wind Flow Line 3 (Lower) */}
                <div className="absolute top-[75%] left-0 w-full h-[2.5px]">
                  <div className="w-32 h-full rounded-full bg-gradient-to-r from-transparent via-[#8EDCFF]/80 to-transparent shadow-[0_0_10px_#8EDCFF] animate-wind-flow-slow" />
                </div>

                {/* Flowing SVG wind streamlines that continuously travel across */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 320 180">
                  <defs>
                    <linearGradient id="windStreamGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8EDCFF" stopOpacity="0" />
                      <stop offset="40%" stopColor="#8EDCFF" stopOpacity="0.9" />
                      <stop offset="60%" stopColor="#d1f2ff" stopOpacity="1" />
                      <stop offset="100%" stopColor="#8EDCFF" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="windStreamGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F6B73C" stopOpacity="0" />
                      <stop offset="50%" stopColor="#fde047" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#F6B73C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M -60,45 C 40,25 120,60 200,40 S 300,50 400,42"
                    fill="none"
                    stroke="url(#windStreamGrad1)"
                    strokeWidth="2.5"
                    strokeDasharray="90 140"
                    className="animate-wind-dash-fast"
                  />
                  <path
                    d="M -60,92 C 50,110 140,75 220,95 S 320,85 400,90"
                    fill="none"
                    stroke="url(#windStreamGrad2)"
                    strokeWidth="3"
                    strokeDasharray="110 130"
                    className="animate-wind-dash-med"
                  />
                  <path
                    d="M -60,135 C 30,120 130,148 210,130 S 310,140 400,132"
                    fill="none"
                    stroke="url(#windStreamGrad1)"
                    strokeWidth="2.5"
                    strokeDasharray="80 150"
                    className="animate-wind-dash-slow"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#8EDCFF]/10 border border-[#8EDCFF]/20 flex items-center justify-center shadow-sm">
                  <Wind className="w-5 h-5 text-[#8EDCFF]" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-mono text-[#8EDCFF] bg-[#8EDCFF]/10 px-2 py-0.5 rounded border border-[#8EDCFF]/20">
                  {currentCity.windDirection} Vector
                </span>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Wind Velocity</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-light text-white">
                    {currentCity.windSpeed}
                  </span>
                  <span className="text-sm font-mono text-zinc-400 ml-1">km/h</span>
                  <span className="text-xs text-zinc-400 font-light ml-2">
                    ({Math.round(currentCity.windSpeed * 0.621)} mph)
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 relative z-10">
                <span>Dispersal: Moderate</span>
                <span className="text-[#63D9B3] font-medium">No Stagnation</span>
              </div>
            </div>

            {/* 4. UV Index Card - Scales in (800ms delay) + Continuous Solar Rays Rotating Around Icon */}
            <div
              id="env-uv-card"
              className={`bg-zinc-900/40 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between hover:border-amber-500/40 hover:-translate-y-1.5 hover:shadow-[0_14px_34px_rgba(245,158,11,0.16)] transition-all duration-700 ease-out group backdrop-blur-xl relative overflow-hidden transform ${
                hasEntered
                  ? 'opacity-100 scale-100 pointer-events-auto'
                  : 'opacity-0 scale-50 pointer-events-none'
              }`}
              style={{
                transitionDelay: '800ms',
              }}
            >
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="relative flex items-center justify-center">
                  {/* Clearly visible rotating solar rays centered directly around the UV icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 flex items-center justify-center animate-uv-rays-spin">
                      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="uvIconRayGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.85" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                          <line
                            key={deg}
                            x1="50"
                            y1="50"
                            x2={50 + 42 * Math.cos((deg * Math.PI) / 180)}
                            y2={50 + 42 * Math.sin((deg * Math.PI) / 180)}
                            stroke="url(#uvIconRayGrad)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                        ))}
                      </svg>
                    </div>
                    {/* Soft pulsating amber solar corona halo */}
                    <div className="absolute w-12 h-12 rounded-full bg-amber-400/25 blur-md animate-uv-corona" />
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.3)] relative z-10">
                    <Sun className="w-5 h-5 text-amber-400 animate-uv-icon" />
                  </div>
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${
                  currentCity.uvIndex >= 8
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                    : currentCity.uvIndex >= 6
                    ? 'bg-orange-500/10 text-orange-300 border-orange-500/20'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                }`}>
                  {currentCity.uvIndex >= 8 ? 'Very High UV' : currentCity.uvIndex >= 6 ? 'High UV' : 'Moderate UV'}
                </span>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Solar UV Index</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-light text-white">
                    {currentCity.uvIndex}
                  </span>
                  <span className="text-xs text-zinc-400 font-light">
                    / 12 Peak Scale
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 relative z-10">
                <span>Protection: {currentCity.uvIndex >= 6 ? 'Required' : 'Optional'}</span>
                <span className="text-amber-400 font-medium">SPF 30+ Advised</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Pollutants Matrix Bar (Progressive reveal) */}
        {showPollutantDetails && (
          <div
            id="env-pollutants-drawer"
            className={`w-full bg-zinc-900/60 rounded-2xl p-4 sm:p-5 border border-zinc-800 mb-8 transition-all duration-700 ease-out transform ${
              hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{
              transitionDelay: '780ms',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#8EDCFF]" />
                Airborne Pollutant Breakdown (Concentration Density)
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">WHO Standards Compliant</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">PM2.5 (Fine)</span>
                <span className="text-lg font-light font-mono text-[#63D9B3]">{currentCity.pollutants.pm25} <span className="text-xs text-zinc-500 font-normal">µg/m³</span></span>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#63D9B3] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (currentCity.pollutants.pm25 / 35) * 100)}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">PM10 (Coarse)</span>
                <span className="text-lg font-light font-mono text-zinc-200">{currentCity.pollutants.pm10} <span className="text-xs text-zinc-500 font-normal">µg/m³</span></span>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (currentCity.pollutants.pm10 / 50) * 100)}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">O3 (Ozone)</span>
                <span className="text-lg font-light font-mono text-amber-300">{currentCity.pollutants.o3} <span className="text-xs text-zinc-500 font-normal">ppb</span></span>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (currentCity.pollutants.o3 / 70) * 100)}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">NO2</span>
                <span className="text-lg font-light font-mono text-zinc-200">{currentCity.pollutants.no2} <span className="text-xs text-zinc-500 font-normal">ppb</span></span>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (currentCity.pollutants.no2 / 50) * 100)}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">CO</span>
                <span className="text-lg font-light font-mono text-zinc-200">{currentCity.pollutants.co} <span className="text-xs text-zinc-500 font-normal">ppm</span></span>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#63D9B3] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (currentCity.pollutants.co / 2) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Story Continuation Callout */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 transition-all duration-700 ease-out transform ${
            hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{
            transitionDelay: '880ms',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5C4D]/10 border border-[#FF5C4D]/30 flex items-center justify-center text-[#FF5C4D]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white">
                How do these conditions impact you specifically?
              </p>
              <p className="text-xs text-zinc-400">
                AQI {currentCity.aqi} may be harmless for a healthy adult, but hazardous for an asthmatic child or cardiac senior.
              </p>
            </div>
          </div>

          <button
            id="env-to-profile-btn"
            onClick={onScrollToNext}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#FF5C4D] hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>Calibrate Bio-Profile</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

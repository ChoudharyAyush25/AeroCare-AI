import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Zap,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { EnvironmentalData, RiskLevel, WeatherVisualType } from '../types';

interface WeatherEnvironmentProps {
  currentCity: EnvironmentalData;
  activeSection: string;
  riskLevel: RiskLevel;
  weatherOverride: WeatherVisualType | null;
  onWeatherOverrideChange: (override: WeatherVisualType | null) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  length?: number;
  angle?: number;
  wobble?: number;
  splashAge?: number;
  splashMaxAge?: number;
}

interface WindStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
  width: number;
}

export const WeatherEnvironment: React.FC<WeatherEnvironmentProps> = ({
  currentCity,
  activeSection,
  riskLevel,
  weatherOverride,
  onWeatherOverrideChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [lightningFlash, setLightningFlash] = useState(0); // 0 to 1
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Compute effective condition
  const effectiveCondition: WeatherVisualType = useMemo(() => {
    if (weatherOverride) return weatherOverride;
    if (currentCity.aqi >= 150 || currentCity.weatherCondition === 'Hazy') return 'poor_aqi';
    if (currentCity.weatherCondition === 'Clear' || currentCity.uvIndex >= 7) return 'sunny';
    if (currentCity.weatherCondition === 'Overcast') return 'cloudy';
    if (currentCity.weatherCondition === 'Breezy' || currentCity.windSpeed >= 24) return 'windy';
    return 'cloudy';
  }, [weatherOverride, currentCity]);

  // Track smoothed mouse coordinates for parallax
  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      setMouseOffset({ x: currentX, y: currentY });
      animId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Storm lightning generator
  useEffect(() => {
    if (effectiveCondition !== 'storm') {
      setLightningFlash(0);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    const triggerLightning = () => {
      // Primary flash
      setLightningFlash(0.75);
      setTimeout(() => {
        setLightningFlash(0.1);
        setTimeout(() => {
          // Secondary aftershock flash
          setLightningFlash(0.9);
          setTimeout(() => setLightningFlash(0), 120);
        }, 60);
      }, 70);

      // Random delay until next lightning (4 to 9 seconds)
      const nextDelay = Math.random() * 5000 + 4000;
      timeoutId = setTimeout(triggerLightning, nextDelay);
    };

    timeoutId = setTimeout(triggerLightning, 2500);
    return () => clearTimeout(timeoutId);
  }, [effectiveCondition]);

  // Canvas 2D Particle & Precipitation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize particles based on condition
    let particles: Particle[] = [];
    let windStreaks: WindStreak[] = [];

    const windFactor = Math.min(2.4, Math.max(0.55, currentCity.windSpeed / 12));
    const aqiFactor = Math.min(1, Math.max(0, currentCity.aqi / 250));

    const initSimulation = () => {
      particles = [];
      windStreaks = [];

      if (effectiveCondition === 'sunny') {
        const count = 45;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.4) * 0.4,
            vy: -Math.random() * 0.5 - 0.15,
            size: Math.random() * 2.2 + 1,
            alpha: Math.random() * 0.45 + 0.2,
            baseAlpha: Math.random() * 0.45 + 0.2,
            color: 'rgba(251, 191, 36, ', // warm amber/gold
            wobble: Math.random() * Math.PI * 2,
          });
        }
      } else if (effectiveCondition === 'cloudy') {
        const count = 35;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: -Math.random() * 0.25 - 0.05,
            size: Math.random() * 2 + 0.8,
            alpha: Math.random() * 0.25 + 0.1,
            baseAlpha: Math.random() * 0.25 + 0.1,
            color: 'rgba(203, 213, 225, ', // silver-slate mist
            wobble: Math.random() * Math.PI * 2,
          });
        }
      } else if (effectiveCondition === 'rainy') {
        const count = 160;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * (width + 200) - 100,
            y: Math.random() * height,
            vx: 2.5 + windFactor * 2.4, // slanted rainfall follows local wind
            vy: Math.random() * 10 + 16,
            size: Math.random() * 0.8 + 0.8,
            length: Math.random() * 20 + 14,
            alpha: Math.random() * 0.35 + 0.25,
            baseAlpha: 0.3,
            color: 'rgba(125, 211, 252, ',
          });
        }
      } else if (effectiveCondition === 'windy') {
        const count = 40;
        for (let i = 0; i < count; i++) {
          windStreaks.push({
            x: Math.random() * width,
            y: Math.random() * height,
            length: Math.random() * 120 + 60,
            speed: (Math.random() * 12 + 14) * windFactor,
            alpha: Math.random() * 0.25 + 0.1,
            width: Math.random() * 1.5 + 0.8,
          });
        }
        // Micro airborne leaves/debris
        for (let i = 0; i < 25; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: Math.random() * 6 + 6,
            vy: Math.sin(Math.random() * 2) * 1.5,
            size: Math.random() * 2 + 1,
            alpha: Math.random() * 0.4 + 0.2,
            baseAlpha: 0.3,
            color: 'rgba(52, 211, 153, ', // emerald pollen
            wobble: Math.random() * Math.PI * 2,
          });
        }
      } else if (effectiveCondition === 'storm') {
        const count = 220;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * (width + 300) - 150,
            y: Math.random() * height,
            vx: 6.5,
            vy: Math.random() * 14 + 22,
            size: Math.random() * 1.2 + 0.8,
            length: Math.random() * 26 + 18,
            alpha: Math.random() * 0.4 + 0.3,
            baseAlpha: 0.35,
            color: 'rgba(186, 230, 253, ',
          });
        }
      } else if (effectiveCondition === 'poor_aqi') {
        const count = Math.round(65 + aqiFactor * 45);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.45) * (0.35 + windFactor * 0.25),
            vy: -Math.random() * 0.35 - 0.05,
            size: Math.random() * 3.5 + 1.2,
            alpha: Math.random() * 0.35 + 0.25 + aqiFactor * 0.2,
            baseAlpha: 0.3 + aqiFactor * 0.22,
            color: 'rgba(217, 119, 6, ', // suspended amber particulate
            wobble: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    initSimulation();

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // 1. If in AI synthesis section, render synaptic neural connections
      if (activeSection === 'analysis' && particles.length > 0) {
        const maxDist = 80;
        for (let i = 0; i < Math.min(particles.length, 50); i++) {
          for (let j = i + 1; j < Math.min(particles.length, 50); j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * 0.12;
              ctx.beginPath();
              ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
              ctx.lineWidth = 0.8;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // 2. Render wind streaks (windy condition)
      if (effectiveCondition === 'windy') {
        windStreaks.forEach((streak) => {
          streak.x += streak.speed;
          if (streak.x > width + streak.length) {
            streak.x = -streak.length;
            streak.y = Math.random() * height;
          }

          const grad = ctx.createLinearGradient(
            streak.x - streak.length,
            streak.y,
            streak.x,
            streak.y
          );
          grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          grad.addColorStop(0.7, `rgba(52, 211, 153, ${streak.alpha})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${streak.alpha * 1.5})`);

          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = streak.width;
          ctx.moveTo(streak.x - streak.length, streak.y);
          ctx.lineTo(streak.x, streak.y);
          ctx.stroke();
        });
      }

      // 3. Render particles (rain / sunlight motes / haze particles)
      particles.forEach((p) => {
        if (effectiveCondition === 'rainy' || effectiveCondition === 'storm') {
          // Rain streak drawing
          p.x += p.vx;
          p.y += p.vy;

          if (p.y > height) {
            p.y = -p.length!;
            p.x = Math.random() * (width + 200) - 100;
          }

          ctx.beginPath();
          ctx.strokeStyle = `${p.color}${p.alpha})`;
          ctx.lineWidth = p.size;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 1.5, p.y - p.length!);
          ctx.stroke();
        } else {
          // Ambient floating particulate with gentle harmonic oscillation
          p.wobble = (p.wobble || 0) + 0.02;
          p.x += p.vx + Math.sin(p.wobble) * 0.25;
          p.y += p.vy;

          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;

          const currentAlpha = p.baseAlpha + Math.sin(frame * 0.04 + (p.wobble || 0)) * 0.08;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${Math.max(0.04, currentAlpha)})`;
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [effectiveCondition, activeSection, currentCity.windSpeed, currentCity.aqi]);

  // Section-aware atmosphere tuning
  const sectionAtmosphere = useMemo(() => {
    switch (activeSection) {
      case 'risk':
        if (riskLevel === 'severe') {
          return {
            ambientTint: 'from-rose-950/40 via-red-950/20 to-[#050505]',
            glowColor: 'bg-rose-500/20',
            clarity: 'opacity-90',
          };
        }
        if (riskLevel === 'high') {
          return {
            ambientTint: 'from-orange-950/30 via-amber-950/15 to-[#050505]',
            glowColor: 'bg-orange-500/15',
            clarity: 'opacity-90',
          };
        }
        if (riskLevel === 'moderate') {
          return {
            ambientTint: 'from-amber-950/25 via-zinc-950/20 to-[#050505]',
            glowColor: 'bg-amber-500/10',
            clarity: 'opacity-85',
          };
        }
        return {
          ambientTint: 'from-emerald-950/25 via-zinc-950/20 to-[#050505]',
          glowColor: 'bg-emerald-500/15',
          clarity: 'opacity-85',
        };
      case 'trends':
        // Subdued so charts pop with maximum readability
        return {
          ambientTint: 'from-zinc-950 via-[#050505] to-[#050505]',
          glowColor: 'bg-emerald-500/5',
          clarity: 'opacity-40',
        };
      case 'analysis':
        return {
          ambientTint: 'from-emerald-950/30 via-sky-950/20 to-[#050505]',
          glowColor: 'bg-emerald-400/15',
          clarity: 'opacity-85',
        };
      case 'profile':
        return {
          ambientTint: 'from-zinc-950/60 via-[#050505] to-[#050505]',
          glowColor: 'bg-sky-500/10',
          clarity: 'opacity-75',
        };
      case 'environment':
        return {
          ambientTint: 'from-sky-950/30 via-emerald-950/15 to-[#050505]',
          glowColor: 'bg-emerald-400/20',
          clarity: 'opacity-90',
        };
      default: // 'hero'
        return {
          ambientTint: 'from-transparent via-transparent to-[#050505]',
          glowColor: 'bg-amber-500/15',
          clarity: 'opacity-100',
        };
    }
  }, [activeSection, riskLevel]);

  // Weather Condition Theme Palettes
  const conditionTheme = useMemo(() => {
    switch (effectiveCondition) {
      case 'sunny':
        return {
          skyGradient: 'from-[#0b1426] via-[#1a1c28] to-[#281c15]',
          horizonGlow: 'from-amber-500/25 via-orange-500/15 to-transparent',
          sunVisible: true,
          cloudColor: '#2b3040',
          cloudHighlight: '#d48d44',
          cloudSpeedClass1: 'animate-cloud-drift-1',
          cloudSpeedClass2: 'animate-cloud-drift-2',
          mistOpacity: 'opacity-45',
          hazeOverlay: false,
        };
      case 'cloudy':
        return {
          skyGradient: 'from-[#080b12] via-[#101622] to-[#181d28]',
          horizonGlow: 'from-slate-400/10 via-teal-500/5 to-transparent',
          sunVisible: false,
          cloudColor: '#1e2430',
          cloudHighlight: '#475569',
          cloudSpeedClass1: 'animate-cloud-drift-1',
          cloudSpeedClass2: 'animate-cloud-drift-2',
          mistOpacity: 'opacity-65',
          hazeOverlay: false,
        };
      case 'rainy':
        return {
          skyGradient: 'from-[#050812] via-[#09111c] to-[#0e1724]',
          horizonGlow: 'from-sky-500/15 via-blue-500/10 to-transparent',
          sunVisible: false,
          cloudColor: '#131924',
          cloudHighlight: '#334155',
          cloudSpeedClass1: 'animate-cloud-drift-2',
          cloudSpeedClass2: 'animate-cloud-drift-fast',
          mistOpacity: 'opacity-75',
          hazeOverlay: false,
        };
      case 'windy':
        return {
          skyGradient: 'from-[#040914] via-[#081724] to-[#0d222e]',
          horizonGlow: 'from-teal-400/20 via-sky-400/10 to-transparent',
          sunVisible: false,
          cloudColor: '#172230',
          cloudHighlight: '#38bdf8',
          cloudSpeedClass1: 'animate-cloud-drift-2',
          cloudSpeedClass2: 'animate-cloud-drift-fast',
          mistOpacity: 'opacity-40',
          hazeOverlay: false,
        };
      case 'storm':
        return {
          skyGradient: 'from-[#030308] via-[#090714] to-[#120d20]',
          horizonGlow: 'from-indigo-500/20 via-purple-500/10 to-transparent',
          sunVisible: false,
          cloudColor: '#0e0e18',
          cloudHighlight: '#475569',
          cloudSpeedClass1: 'animate-cloud-drift-fast',
          cloudSpeedClass2: 'animate-cloud-drift-fast',
          mistOpacity: 'opacity-80',
          hazeOverlay: false,
        };
      case 'poor_aqi':
        return {
          skyGradient: 'from-[#120c06] via-[#22140a] to-[#2c1a0e]',
          horizonGlow: 'from-amber-600/30 via-yellow-600/15 to-transparent',
          sunVisible: true,
          sunHazy: true,
          cloudColor: '#2b1c12',
          cloudHighlight: '#b45309',
          cloudSpeedClass1: 'animate-cloud-drift-1',
          cloudSpeedClass2: 'animate-cloud-drift-2',
          mistOpacity: 'opacity-90',
          hazeOverlay: true,
        };
    }
  }, [effectiveCondition]);

  return (
    <div
      ref={containerRef}
      id="weather-environment-root"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-all duration-1000"
      style={{ perspective: '1000px' }}
    >
      {/* 1. Base Dynamic Sky Gradient with section tint */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${conditionTheme.skyGradient} transition-all duration-1000`}
      />

      {/* Lightning Flash Layer (for storm condition) */}
      {effectiveCondition === 'storm' && (
        <div
          className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-75"
          style={{ opacity: lightningFlash }}
        />
      )}

      {/* 2. Horizon Glow (Warm sunrise/sunset or condition twilight) */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-3/5 bg-gradient-to-t ${conditionTheme.horizonGlow} transition-all duration-1000`}
        style={{
          transform: `translate3d(${mouseOffset.x * 8}px, ${mouseOffset.y * 6}px, 0)`,
        }}
      />

      {/* 3. Sun & Volumetric Sunbeams (active in Sunny / Clear conditions) */}
      {(conditionTheme.sunVisible || effectiveCondition === 'sunny') && (
        <div
          className="absolute top-[8%] right-[14%] pointer-events-none transition-all duration-1000"
          style={{
            transform: `translate3d(${mouseOffset.x * -24}px, ${mouseOffset.y * -16}px, 0)`,
          }}
        >
          {/* Volumetric Sun Rays */}
          <div className="relative w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="absolute inset-0 animate-sun-rays opacity-25">
              <svg viewBox="0 0 500 500" className="w-full h-full">
                <defs>
                  <radialGradient id="sunbeamGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                    <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* 12 Volumetric Radial Ray Wedges */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 360) / 12;
                  return (
                    <polygon
                      key={i}
                      points="250,250 210,0 290,0"
                      fill="url(#sunbeamGrad)"
                      transform={`rotate(${angle} 250 250)`}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Glowing Sun Core & Corona */}
            <div className="absolute w-36 h-36 rounded-full bg-gradient-to-br from-amber-100 via-amber-300 to-orange-400 blur-md animate-sun-corona shadow-[0_0_80px_rgba(251,191,36,0.8)]" />
            <div className="absolute w-20 h-20 rounded-full bg-white blur-sm" />
            <div className="absolute w-52 h-52 rounded-full bg-amber-400/20 blur-2xl animate-pulse" />
          </div>
        </div>
      )}

      {/* 4. Layer 1: High-Altitude Atmospheric Stratus Clouds (for subsequent sections) */}
      {activeSection !== 'hero' && (
        <div
          className={`absolute top-[4%] left-0 w-[200%] h-72 ${conditionTheme.cloudSpeedClass1} transition-all duration-1000 ${sectionAtmosphere.clarity}`}
          style={{
            transform: `translate3d(${mouseOffset.x * 12}px, ${mouseOffset.y * 8}px, 0)`,
          }}
        >
          <svg viewBox="0 0 2000 300" className="w-full h-full preserve-3d" preserveAspectRatio="none">
            <defs>
              <linearGradient id="highCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={conditionTheme.cloudHighlight} stopOpacity="0.28" />
                <stop offset="60%" stopColor={conditionTheme.cloudColor} stopOpacity="0.18" />
                <stop offset="100%" stopColor={conditionTheme.cloudColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,150 Q250,60 500,120 T1000,100 T1500,130 T2000,90 L2000,300 L0,300 Z"
              fill="url(#highCloudGrad)"
            />
          </svg>
        </div>
      )}

      {/* 5. Layer 2: Mid-Altitude Billowing Cumulus Bank (for subsequent sections) */}
      {activeSection !== 'hero' && (
        <div
          className={`absolute top-[18%] left-0 w-[200%] h-96 ${conditionTheme.cloudSpeedClass2} transition-all duration-1000 ${sectionAtmosphere.clarity}`}
          style={{
            transform: `translate3d(${mouseOffset.x * 24}px, ${mouseOffset.y * 14}px, 0)`,
          }}
        >
          <svg viewBox="0 0 2000 400" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="midCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={conditionTheme.cloudHighlight} stopOpacity="0.45" />
                <stop offset="35%" stopColor={conditionTheme.cloudColor} stopOpacity="0.55" />
                <stop offset="100%" stopColor="#050505" stopOpacity="0.1" />
              </linearGradient>
              <filter id="cloudSoftBlur">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>
            <path
              d="M 0,280 
                 C 80,240 140,210 240,230 
                 C 320,180 440,160 560,210 
                 C 640,150 780,140 880,190 
                 C 960,130 1120,120 1240,180 
                 C 1340,140 1480,160 1580,210 
                 C 1680,170 1820,190 1920,240 
                 L 2000,280 L 2000,400 L 0,400 Z"
              fill="url(#midCloudGrad)"
              filter="url(#cloudSoftBlur)"
            />
          </svg>
        </div>
      )}

      {/* 6. Layer 3: Low Rolling Fog / Mist Bank (for subsequent sections) */}
      {activeSection !== 'hero' && (
        <div
          className={`absolute bottom-0 left-0 right-0 h-80 pointer-events-none transition-all duration-1000 ${conditionTheme.mistOpacity} ${sectionAtmosphere.clarity}`}
          style={{
            transform: `translate3d(${mouseOffset.x * 35}px, ${mouseOffset.y * 20}px, 0)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-64 animate-mist-slow">
            <svg viewBox="0 0 1600 240" className="w-full h-full opacity-60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={conditionTheme.cloudHighlight} stopOpacity="0.35" />
                  <stop offset="50%" stopColor={conditionTheme.cloudColor} stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#050505" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <path
                d="M0,120 Q200,40 400,90 T800,60 T1200,80 T1600,50 L1600,240 L0,240 Z"
                fill="url(#mistGrad)"
              />
            </svg>
          </div>
        </div>
      )}

      {/* 7. Haze / Smog Overlay (for Poor AQI condition) */}
      {conditionTheme.hazeOverlay && (
        <div
          className="absolute inset-0 atmosphere-aqi-haze pointer-events-none"
          style={{ opacity: Math.min(0.72, 0.18 + currentCity.aqi / 260) }}
        />
      )}

      {/* 8. Active Section Dynamic Ambient Tint (e.g. Risk level warning glow, Analysis streams) */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${sectionAtmosphere.ambientTint} transition-all duration-1000 pointer-events-none`}
      />

      {/* Dynamic ambient section glow orb */}
      <div
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] ${sectionAtmosphere.glowColor} rounded-full blur-[160px] pointer-events-none transition-all duration-1000`}
        style={{
          transform: `translate3d(${mouseOffset.x * 20}px, ${mouseOffset.y * 15}px, 0)`,
        }}
      />

      {/* 9. Interactive Particle & Rain/Wind FX Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-700"
      />

      {/* 10. Subtle Vignette Scrim so UI text remains 100% crisp and readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505]/60 pointer-events-none" />

      {/* 11. Interactive Weather Simulator Controller (Tasteful floating quick selector) */}
      <div className="fixed bottom-6 left-6 z-50 pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Main Status / Toggle Pill */}
          <button
            id="weather-env-trigger"
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 backdrop-blur-xl text-zinc-200 text-xs font-medium shadow-2xl transition-all cursor-pointer group"
            title="Toggle Dynamic Weather Environment"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              Atmosphere:
            </span>
            <span className="font-semibold capitalize text-emerald-300 flex items-center gap-1.5">
              {effectiveCondition === 'sunny' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
              {effectiveCondition === 'cloudy' && <Cloud className="w-3.5 h-3.5 text-slate-300" />}
              {effectiveCondition === 'rainy' && <CloudRain className="w-3.5 h-3.5 text-sky-400" />}
              {effectiveCondition === 'windy' && <Wind className="w-3.5 h-3.5 text-teal-400" />}
              {effectiveCondition === 'storm' && <Zap className="w-3.5 h-3.5 text-violet-400" />}
              {effectiveCondition === 'poor_aqi' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
              {effectiveCondition.replace('_', ' ')}
            </span>
            {weatherOverride && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Manual
              </span>
            )}
          </button>

          {/* Reset to City Default if manual override active */}
          {weatherOverride && (
            <button
              onClick={() => onWeatherOverrideChange(null)}
              className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Reset to City Live Sensor Weather"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Expanded Quick Weather Mode Tray */}
        {isSwitcherOpen && (
          <div
            id="weather-env-tray"
            className="mt-2 p-2 rounded-2xl bg-zinc-950/95 border border-zinc-800 backdrop-blur-2xl shadow-2xl flex flex-wrap items-center gap-1.5 max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div className="w-full px-2 py-1 flex items-center justify-between border-b border-zinc-800/80 text-[10px] font-mono text-zinc-400 mb-1">
              <span>SIMULATE ATMOSPHERIC CONDITION</span>
              <Sparkles className="w-3 h-3 text-emerald-400" />
            </div>

            {[
              { id: 'sunny' as const, label: 'Sunny', icon: Sun, color: 'text-amber-400' },
              { id: 'cloudy' as const, label: 'Cloudy', icon: Cloud, color: 'text-slate-300' },
              { id: 'rainy' as const, label: 'Rainy', icon: CloudRain, color: 'text-sky-400' },
              { id: 'windy' as const, label: 'Windy', icon: Wind, color: 'text-teal-400' },
              { id: 'storm' as const, label: 'Storm', icon: Zap, color: 'text-violet-400' },
              { id: 'poor_aqi' as const, label: 'Hazy / Poor AQI', icon: AlertTriangle, color: 'text-amber-500' },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = effectiveCondition === item.id;
              return (
                <button
                  key={item.id}
                  id={`weather-btn-${item.id}`}
                  onClick={() => {
                    onWeatherOverrideChange(item.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => {
                onWeatherOverrideChange(null);
                setIsSwitcherOpen(false);
              }}
              className="w-full mt-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 flex items-center justify-center gap-1.5 border border-zinc-800/60 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Sync with {currentCity.location} Live Data</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

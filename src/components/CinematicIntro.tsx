import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Activity,
  Wind,
  Shield,
  Radio,
  ArrowRight,
  Eye,
  CheckCircle2,
  Sparkles,
  Compass
} from 'lucide-react';
import gsap from 'gsap';
import { EnvironmentalData } from '../types';

interface CinematicIntroProps {
  currentCity: EnvironmentalData;
  onComplete: () => void;
}

interface StreamParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  targetAlpha: number;
}

interface RadarRing {
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color: string;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({
  currentCity,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const brandTitleRef = useRef<HTMLHeadingElement>(null);
  const enterBtnRef = useRef<HTMLButtonElement>(null);

  // Phases: 'boot' | 'telemetry' | 'reticle' | 'identity' | 'primed' | 'exiting'
  const [phase, setPhase] = useState<'boot' | 'telemetry' | 'reticle' | 'identity' | 'primed' | 'exiting'>('boot');
  const [telemetryLines, setTelemetryLines] = useState<string[]>([]);
  const [systemProgress, setSystemProgress] = useState<number>(12);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, normX: 0, normY: 0 });
  const [isWarping, setIsWarping] = useState<boolean>(false);

  // Check user motion preferences
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Real data details
  const locationLabel = currentCity?.location || 'GLOBAL ATMOSPHERIC GRID';
  const aqiVal = currentCity?.aqi ?? 42;
  const aqiCat = currentCity?.aqiCategory || 'Moderate';
  const pm25Val = currentCity?.pollutants?.pm25 ?? 12.8;
  const tempVal = currentCity?.temperature ?? 21;
  const uvVal = currentCity?.uvIndex ?? 4.5;
  const latVal = currentCity?.coordinates?.latitude?.toFixed(4) || '37.7749';
  const lonVal = currentCity?.coordinates?.longitude?.toFixed(4) || '-122.4194';

  // Trigger smooth exit transition
  const handleEnterExperience = useCallback(() => {
    if (phase === 'exiting') return;
    setPhase('exiting');
    setIsWarping(true);

    if (prefersReducedMotion) {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.inOut',
          onComplete,
        });
      } else {
        onComplete();
      }
      return;
    }

    // Warp sequence GSAP timeline
    const exitTl = gsap.timeline({
      onComplete: () => {
        onComplete();
      },
    });

    // Fade out textual content rapidly with subtle scale
    exitTl.to(contentRef.current, {
      opacity: 0,
      scale: 1.08,
      filter: 'blur(10px)',
      duration: 0.5,
      ease: 'power2.in',
    });

    // Explode container opacity into the live app
    exitTl.to(
      containerRef.current,
      {
        opacity: 0,
        duration: 0.6,
        ease: 'power3.inOut',
      },
      '-=0.2'
    );
  }, [phase, onComplete, prefersReducedMotion]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleEnterExperience();
      } else if (e.key === 'Enter' || e.key === ' ') {
        handleEnterExperience();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleEnterExperience]);

  // Track mouse coordinates for dynamic 3D tilt & magnetic particle repulsion
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const normX = (e.clientX / w - 0.5) * 2;
      const normY = (e.clientY / h - 0.5) * 2;
      setMousePos({ x: e.clientX, y: e.clientY, normX, normY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // System Boot Sequence Timers
  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase('primed');
      setSystemProgress(100);
      return;
    }

    // Timeline markers
    const timers: NodeJS.Timeout[] = [];

    // Stage 1: Telemetry streams ignite (0.8s)
    timers.push(
      setTimeout(() => {
        setPhase('telemetry');
        setSystemProgress(38);
        setTelemetryLines([
          `[00:00:14] INITIALIZING ATMOSPHERIC SENSOR NODES...`,
          `[00:00:22] GPS LOCK: ${latVal}°N, ${lonVal}°W // ${locationLabel.toUpperCase()}`,
          `[00:00:39] SPECTROMETRY: PM2.5 ${pm25Val} µg/m³ • AQI ${aqiVal} [${aqiCat.toUpperCase()}]`,
        ]);
      }, 700)
    );

    // Stage 2: Central Reticle & UV/Thermal Calibration (2.1s)
    timers.push(
      setTimeout(() => {
        setPhase('reticle');
        setSystemProgress(68);
        setTelemetryLines((prev) => [
          ...prev,
          `[00:00:54] SOLAR FLUX CALIBRATION: UV INDEX ${uvVal} // AMBIENT ${tempVal}°C`,
          `[00:01:08] BIO-PROFILE NEURAL TENSOR: READY`,
        ]);
      }, 2000)
    );

    // Stage 3: Identity Materialization (3.4s)
    timers.push(
      setTimeout(() => {
        setPhase('identity');
        setSystemProgress(88);
      }, 3400)
    );

    // Stage 4: Fully Primed for Entry (4.6s)
    timers.push(
      setTimeout(() => {
        setPhase('primed');
        setSystemProgress(100);
      }, 4600)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [locationLabel, aqiVal, aqiCat, pm25Val, tempVal, uvVal, latVal, lonVal, prefersReducedMotion]);

  // High-Performance Particle Engine & Lidar Radar Canvas
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
      if (!canvas) return;
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

    // Generate Particle Field with Solar Eclipse Atmospheric Intelligence Palette
    const numParticles = width < 768 ? 90 : 180;
    const particles: StreamParticle[] = Array.from({ length: numParticles }).map(() => {
      // Palette: Ice Blue (#8EDCFF), Solar Gold (#F6B73C), Electric Coral (#FF5C4D), Soft Mint (#63D9B3)
      const rand = Math.random();
      const color = rand > 0.65
        ? '142, 220, 255' // Ice Blue #8EDCFF (telemetry)
        : rand > 0.35
        ? '246, 183, 60'  // Solar Gold #F6B73C (solar energy)
        : rand > 0.1
        ? '255, 92, 77'   // Electric Coral #FF5C4D (AeroCare accent)
        : '99, 217, 179'; // Soft Mint #63D9B3 (pure biospheric)

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 1000 + 100,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 1.8 + 0.8,
        color,
        alpha: 0.1,
        baseAlpha: Math.random() * 0.55 + 0.25,
        targetAlpha: Math.random() * 0.55 + 0.25,
      };
    });

    // Radar Lidar Sweep Rings - Atmospheric Gold, Ice Blue, and Electric Coral
    const rings: RadarRing[] = [
      { radius: 30, maxRadius: Math.max(width, height) * 0.85, alpha: 0.7, speed: 2.2, color: '246, 183, 60' }, // Solar Gold
      { radius: 120, maxRadius: Math.max(width, height) * 0.85, alpha: 0.5, speed: 2.6, color: '142, 220, 255' }, // Ice Blue
      { radius: 240, maxRadius: Math.max(width, height) * 0.85, alpha: 0.35, speed: 3.0, color: '255, 92, 77' }, // Electric Coral
    ];

    let radarSweepAngle = 0;
    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Draw subtle digital atmospheric grid lines in Smoky Violet / Ice Blue
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(142, 220, 255, 0.035)';
      const gridSize = 80;
      for (let x = (time * 15) % gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = (time * 15) % gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Radar / Sonar Rings expanding from center
      rings.forEach((ring) => {
        ring.radius += ring.speed * (isWarping ? 8 : 1);
        if (ring.radius > ring.maxRadius) {
          ring.radius = 20;
        }

        const progress = ring.radius / ring.maxRadius;
        const currentAlpha = Math.max(0, (1 - progress) * ring.alpha);

        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ring.color}, ${currentAlpha * 0.35})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 3. Draw Rotating Radar Telemetry Sweep Beam in Solar Gold & Electric Coral
      radarSweepAngle += isWarping ? 0.08 : 0.015;
      const sweepRadius = Math.min(width, height) * 0.45;
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, sweepRadius);
      gradient.addColorStop(0, 'rgba(255, 92, 77, 0.12)'); // Electric Coral
      gradient.addColorStop(0.7, 'rgba(246, 183, 60, 0.04)'); // Solar Gold
      gradient.addColorStop(1, 'transparent');

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(radarSweepAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, sweepRadius, 0, Math.PI / 4);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();

      // 4. Update & Render Particles with Vector Flow & Warp Convergence
      const warpSpeed = isWarping ? 28 : 1;
      particles.forEach((p) => {
        if (isWarping) {
          // Accelerate particles outward in hyperspace warp
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          p.x += (dx / dist) * warpSpeed * 6;
          p.y += (dy / dist) * warpSpeed * 6;
          p.alpha = Math.max(0, p.alpha - 0.015);
        } else {
          // Ambient vector drift + slight orbital force around center
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          // Gentle gravitational pull towards core
          p.vx += (dx / dist) * 0.02;
          p.vy += (dy / dist) * 0.02;

          // Drag to keep smooth
          p.vx *= 0.98;
          p.vy *= 0.98;

          p.x += p.vx;
          p.y += p.vy;

          // Wrap boundaries
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;

          // Subtle pulse
          p.alpha = p.baseAlpha * (0.8 + Math.sin(time * 2 + p.x * 0.01) * 0.2);
        }

        // Render particle with soft luminous halo
        ctx.beginPath();
        const currentSize = isWarping ? p.size * 2 : p.size;
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, p.alpha)})`;
        ctx.shadowColor = `rgba(${p.color}, 0.6)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 5. Center Atmospheric Core Orb - Solar Eclipse Corona
      const corePulse = Math.sin(time * 3) * 4;
      const coreRadius = Math.max(6, 14 + corePulse);
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 2.5);
      coreGrad.addColorStop(0, 'rgba(255, 92, 77, 0.9)'); // Electric Coral
      coreGrad.addColorStop(0.35, 'rgba(246, 183, 60, 0.45)'); // Solar Gold
      coreGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [isWarping]);

  return (
    <div
      ref={containerRef}
      id="cinematic-intro-container"
      className="fixed inset-0 z-[100] bg-[#080A16] text-[#F4F1EA] overflow-hidden flex flex-col justify-between select-none cursor-default"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Background Deep Atmospheric Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Atmospheric Haze Layer (#151326) */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(21,19,38,0.7)_0%,rgba(8,10,22,0.95)_75%)]" />

      {/* Subtle Scanline Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(246, 183, 60, 0.03) 50%, rgba(8, 10, 22, 0.7) 50%)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Top Telemetry Header Bar */}
      <div className="relative z-10 w-full px-6 py-6 flex items-center justify-between border-b border-white/[0.06] backdrop-blur-xs">
        {/* System Boot Status & Coordinate Pill */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-3 h-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5C4D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5C4D]"></span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#F6B73C] uppercase font-semibold">
              AEROCARE AI // SOLAR ECLIPSE CALIBRATION
            </span>
            <span className="font-mono text-[9px] tracking-wider text-[#8EDCFF]/80">
              STATION: {latVal}°N, {lonVal}°W • CALIBRATION {systemProgress}%
            </span>
          </div>
        </div>

        {/* Action Skip Button [ESC] */}
        <button
          id="intro-skip-btn"
          onClick={handleEnterExperience}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151326]/80 hover:bg-[#1E1B34] border border-white/10 hover:border-[#FF5C4D]/40 text-xs font-mono tracking-widest text-[#C8C3B7] hover:text-[#F4F1EA] transition-all duration-200 cursor-pointer"
        >
          <span>SKIP SEQUENCE</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 group-hover:bg-[#FF5C4D]/20 text-[#C8C3B7] font-semibold">
            ESC
          </span>
        </button>
      </div>

      {/* Center Cinematic Stage with Side HUD Brackets */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between my-auto">
        {/* Left Side Atmospheric HUD Bracket (Desktop) */}
        <div className="hidden lg:flex flex-col gap-4 w-60 p-4 rounded-2xl bg-[#151326]/80 border border-white/[0.08] backdrop-blur-md text-left font-mono text-[11px] text-[#C8C3B7] pointer-events-none shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-[#F6B73C] font-semibold text-[10px] tracking-[0.2em]">
            <span>ATMOSPHERIC PROFILE</span>
            <Wind className="w-3.5 h-3.5 text-[#8EDCFF]" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">BAROMETRIC</span>
              <span className="text-[#F4F1EA]">1013.2 hPa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">BOUNDARY LAYER</span>
              <span className="text-[#F4F1EA]">0 - 1.8 km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">PM2.5 DENSITY</span>
              <span className="text-[#8EDCFF] font-medium">{pm25Val} µg/m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">AIR MASS INDEX</span>
              <span className="text-[#F4F1EA]">AM 1.5G</span>
            </div>
          </div>
          <div className="pt-2 border-t border-white/[0.06] text-[9px] text-[#C8C3B7] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#63D9B3]"></span>
            <span>SPECTROMETRY ONLINE</span>
          </div>
        </div>

        {/* Center Main Stage */}
        <div
          ref={contentRef}
          className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center transition-transform duration-300"
          style={{
            transform: `rotateX(${-mousePos.normY * 4}deg) rotateY(${mousePos.normX * 4}deg)`,
          }}
        >
          {/* Floating Solar Eclipse Reticle Graphic */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-6 flex items-center justify-center">
            {/* Outer Rotating Solar Ring */}
            <div
              className="absolute inset-0 rounded-full border border-[#F6B73C]/25 border-dashed animate-[spin_24s_linear_infinite]"
            />
            {/* Inner Counter-Rotating Telemetry Ring */}
            <div
              className="absolute inset-2 sm:inset-3 rounded-full border border-[#8EDCFF]/25 animate-[spin_16s_linear_infinite_reverse]"
            />
            {/* Corner Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
              <span className="w-1.5 h-[1px] bg-[#FF5C4D]/70" />
              <span className="w-1.5 h-[1px] bg-[#FF5C4D]/70" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-between py-1 pointer-events-none">
              <span className="h-1.5 w-[1px] bg-[#FF5C4D]/70" />
              <span className="h-1.5 w-[1px] bg-[#FF5C4D]/70" />
            </div>

            {/* Central Luminous Solar Eclipse Core with Shield Icon */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#FF5C4D]/35 via-[#151326] to-[#F6B73C]/30 backdrop-blur-md border border-[#FF5C4D]/50 flex items-center justify-center shadow-[0_0_40px_rgba(255,92,77,0.35)]">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-[#F4F1EA] animate-pulse" />
            </div>

            {/* Real-time Telemetry Tag hovering on reticle */}
            <div className="absolute -bottom-3 px-2.5 py-0.5 rounded-full bg-[#151326] border border-[#8EDCFF]/30 text-[9px] font-mono tracking-widest text-[#8EDCFF] shadow-md">
              AQI {aqiVal} • {aqiCat.toUpperCase()}
            </div>
          </div>

          {/* Kicker Category Line */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#151326]/90 border border-[#FF5C4D]/25 text-[11px] font-mono tracking-[0.22em] text-[#FF5C4D] uppercase mb-4">
            <Sparkles className="w-3 h-3 text-[#F6B73C] animate-spin" />
            <span>SOLAR ECLIPSE ATMOSPHERIC INTELLIGENCE</span>
          </div>

          {/* Primary Identity Headline */}
          <h1
            ref={brandTitleRef}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#F4F1EA] mb-4 font-display"
          >
            AEROCARE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5C4D] via-[#F6B73C] to-[#8EDCFF]">AI</span>
          </h1>

          {/* Revealing Mission Subtitle */}
          <p className="max-w-xl text-sm sm:text-base md:text-lg text-[#C8C3B7] font-light tracking-wide leading-relaxed mb-6">
            The environment affects everyone. <br className="hidden sm:inline" />
            <span className="text-[#F4F1EA] font-normal">
              AeroCare calculates precisely how it affects{' '}
              <span className="text-[#FF5C4D] font-semibold underline decoration-[#FF5C4D]/50 underline-offset-4">
                you
              </span>
              .
            </span>
          </p>

          {/* Live Detected City Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#151326]/80 border border-white/10 mb-8 backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-[#FF5C4D] animate-pulse" />
            <span className="text-xs text-[#C8C3B7] font-mono">
              SYNCED: <strong className="text-[#F4F1EA] font-medium">{locationLabel}</strong>
            </span>
            <span className="text-zinc-600 font-mono text-xs">|</span>
            <span className="text-xs text-[#F6B73C] font-mono font-medium">
              {tempVal}°C
            </span>
            <span className="text-zinc-600 font-mono text-xs">•</span>
            <span className="text-xs text-[#8EDCFF] font-mono font-medium">
              {aqiVal} AQI
            </span>
          </div>

          {/* Interactive Enter CTA Trigger */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              ref={enterBtnRef}
              id="intro-enter-btn"
              onClick={handleEnterExperience}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF5C4D] via-[#FF6E5F] to-[#F6B73C] text-[#080A16] font-bold text-sm tracking-widest uppercase transition-all duration-300 shadow-[0_0_35px_rgba(255,92,77,0.4)] hover:shadow-[0_0_50px_rgba(255,92,77,0.65)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <span className="font-bold tracking-wider">ENTER INTEL PLATFORM</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#080A16]" />
            </button>
          </div>

          {/* Monospace Telemetry Output Terminal (Compact) */}
          <div className="w-full max-w-xl mt-8 px-4 py-3 rounded-xl bg-[#0D0B1A]/90 border border-white/[0.08] text-left font-mono text-[10px] text-[#C8C3B7] space-y-1 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between text-zinc-500 text-[9px] pb-1 border-b border-white/[0.05]">
              <span className="flex items-center gap-1 text-[#8EDCFF]">
                <Activity className="w-3 h-3 text-[#8EDCFF]" />
                TELEMETRY STREAM
              </span>
              <span>FREQ: 104.2 MHz</span>
            </div>
            {telemetryLines.slice(-3).map((line, idx) => (
              <div key={idx} className="truncate text-[#8EDCFF]/90 font-mono">
                {line}
              </div>
            ))}
            {telemetryLines.length === 0 && (
              <div className="text-[#C8C3B7]/60 animate-pulse">Establishing biospheric satellite uplink...</div>
            )}
          </div>
        </div>

        {/* Right Side Bio-Telemetry HUD Bracket (Desktop) */}
        <div className="hidden lg:flex flex-col gap-4 w-60 p-4 rounded-2xl bg-[#151326]/80 border border-white/[0.08] backdrop-blur-md text-left font-mono text-[11px] text-[#C8C3B7] pointer-events-none shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-[#F6B73C] font-semibold text-[10px] tracking-[0.2em]">
            <span>BIO-CALIBRATION</span>
            <Activity className="w-3.5 h-3.5 text-[#FF5C4D]" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">SOLAR UV FLUX</span>
              <span className="text-[#F6B73C] font-medium">INDEX {uvVal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">RELATIVE HUMIDITY</span>
              <span className="text-[#F4F1EA]">{currentCity.humidity || 52}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">WIND VECTOR</span>
              <span className="text-[#F4F1EA]">{currentCity.windSpeed || 14} km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">NEURAL ENGINE</span>
              <span className="text-[#63D9B3]">CALIBRATED</span>
            </div>
          </div>
          <div className="pt-2 border-t border-white/[0.06] text-[9px] text-[#C8C3B7] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#63D9B3]"></span>
            <span>CELLULAR EXPOSURE LINKED</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Telemetry & Progress Bar */}
      <div className="relative z-10 w-full px-6 py-4 flex flex-col gap-2 border-t border-white/[0.06] bg-[#080A16]/85 backdrop-blur-xs">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#C8C3B7]/70 tracking-wider">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C4D]" />
            <span>PRESS [ENTER] OR CLICK TO INITIALIZE HUD</span>
            {/* Live Atmospheric Harmonic Equalizer Bars */}
            <div className="hidden sm:flex items-center gap-1 h-3 ml-2">
              {[40, 70, 90, 60, 100, 45, 80, 50, 95, 30, 65, 85].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-[#F6B73C]/70 rounded-full transition-all duration-300"
                  style={{
                    height: `${Math.max(3, (h * (systemProgress / 100)) * (0.6 + 0.4 * Math.sin((systemProgress + i * 20) * 0.1)))}px`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="text-[#FF5C4D]/90">
            {phase === 'primed' ? 'SYSTEM PRIMED • CLICK TO ENTER' : 'CALIBRATING SPECTRA...'}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-1 bg-[#151326] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF5C4D] via-[#F6B73C] to-[#8EDCFF] transition-all duration-300 ease-linear shadow-[0_0_12px_rgba(255,92,77,0.5)]"
            style={{
              width: `${systemProgress}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

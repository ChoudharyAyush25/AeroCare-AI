import React, { useEffect, useRef } from 'react';
import {
  UserProfile,
  AgeGroup,
  HealthCondition,
  OutdoorExposure
} from '../types';
import {
  Shield,
  Activity,
  Wind,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';

interface DigitalYouAvatarProps {
  userProfile: UserProfile;
  hasEntered: boolean;
  recentSignal: { type: string; label: string; timestamp: number } | null;
  isCompleted: boolean;
  completionTriggerCount: number;
}

export const DigitalYouAvatar: React.FC<DigitalYouAvatarProps> = ({
  userProfile,
  hasEntered,
  recentSignal,
  isCompleted,
  completionTriggerCount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const convergenceRef = useRef<number>(0);

  // Trigger convergence animation when completionTriggerCount increments
  useEffect(() => {
    if (completionTriggerCount > 0) {
      convergenceRef.current = 1.0;
    }
  }, [completionTriggerCount]);

  // Particle simulation reacting directly to Outdoor Exposure & Completion Convergence
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle count determined by Outdoor Exposure
    const getParticleCount = (exposure: OutdoorExposure) => {
      switch (exposure) {
        case 'low':
          return 22; // Shielded indoor environment
        case 'medium':
          return 65; // Moderate ambient exposure
        case 'high':
          return 130; // Intense particulate exposure
        default:
          return 45;
      }
    };

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number;
      alpha: number;
      color: string;
      orbitAngle: number;
      orbitSpeed: number;
      orbitRadius: number;
    }

    const currentCount = getParticleCount(userProfile.outdoorExposure);
    const particles: Particle[] = [];

    const colorsByExposure: Record<OutdoorExposure, string[]> = {
      low: ['#34d399', '#38bdf8', '#a7f3d0', '#67e8f9'], // Clean filtered air
      medium: ['#38bdf8', '#fbbf24', '#94a3b8', '#6ee7b7'], // Mixed ambient
      high: ['#f97316', '#fbbf24', '#f43f5e', '#e2e8f0'], // Rich airborne pollutants/ozone
    };

    const palette = colorsByExposure[userProfile.outdoorExposure];

    for (let i = 0; i < currentCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 140;
      particles.push({
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * (userProfile.outdoorExposure === 'high' ? 1.4 : 0.6),
        vy: (Math.random() - 0.5) * (userProfile.outdoorExposure === 'high' ? 1.4 : 0.6),
        size: Math.random() * 2.2 + 0.8,
        baseAlpha: Math.random() * 0.6 + 0.25,
        alpha: Math.random() * 0.6 + 0.25,
        color: palette[Math.floor(Math.random() * palette.length)],
        orbitAngle: angle,
        orbitSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        orbitRadius: radius,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.46; // Approximate avatar center

      // Decrease convergence factor gradually
      if (convergenceRef.current > 0.01) {
        convergenceRef.current *= 0.95;
      } else {
        convergenceRef.current = 0;
      }

      particles.forEach((p) => {
        if (convergenceRef.current > 0.02) {
          // Particles vortex into the chest core during completion moment
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          p.x += dx * 0.08 * convergenceRef.current;
          p.y += dy * 0.08 * convergenceRef.current;
          p.alpha = Math.min(1, p.baseAlpha + convergenceRef.current * 0.7);
        } else {
          // Normal behavior: drift & subtle flow
          p.orbitAngle += p.orbitSpeed;

          if (userProfile.outdoorExposure === 'high') {
            // High exposure: particles stream toward and around the silhouette
            const dx = centerX - p.x;
            const dy = centerY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 45) {
              p.x += (dx / dist) * 0.35 + p.vx;
              p.y += (dy / dist) * 0.35 + p.vy;
            } else {
              // Bounce or circulate around the biological boundary
              p.x += p.vx * 2;
              p.y += p.vy * 2;
            }
          } else if (userProfile.outdoorExposure === 'low') {
            // Low exposure: calm orbiting shield away from the body
            p.x = centerX + Math.cos(p.orbitAngle) * (p.orbitRadius + 20);
            p.y = centerY + Math.sin(p.orbitAngle) * (p.orbitRadius * 0.9 + 15);
          } else {
            // Medium exposure
            p.x += p.vx;
            p.y += p.vy;
          }

          // Boundary wrap
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = userProfile.outdoorExposure === 'high' ? 8 : 4;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw subtle connective data-filaments between nearby particles in high exposure
      if (userProfile.outdoorExposure === 'high') {
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.12)';
        ctx.lineWidth = 0.75;
        for (let i = 0; i < particles.length; i += 3) {
          for (let j = i + 1; j < Math.min(i + 4, particles.length); j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 65) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [userProfile.outdoorExposure, completionTriggerCount]);

  // Derived bio-telemetry indicators
  const isAsthma = userProfile.healthCondition === 'asthma';
  const isHeart = userProfile.healthCondition === 'heart_condition';
  const isHealthy = userProfile.healthCondition === 'healthy';

  const conditionTheme = isAsthma
    ? {
        color: 'text-sky-400',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/30',
        label: 'Bronchial Reactivity High',
        organ: 'Respiratory Tract / Alveoli',
      }
    : isHeart
    ? {
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        label: 'Cardiovascular Load Guarded',
        organ: 'Myocardial / Microvascular',
      }
    : {
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        label: 'Physiological Homeostasis',
        organ: 'Epithelial Mucociliary Defense',
      };

  const exposureLevel = {
    low: { label: 'Shielded (Indoor Filtered)', factor: '88% Shielded', color: 'text-emerald-400', bar: 'w-1/4 bg-emerald-500' },
    medium: { label: 'Moderate Ambient Drift', factor: '62% Exposed', color: 'text-sky-400', bar: 'w-2/4 bg-sky-500' },
    high: { label: 'Direct Atmospheric Infiltration', factor: '94% Cumulative Dosage', color: 'text-orange-400', bar: 'w-full bg-orange-500' },
  }[userProfile.outdoorExposure];

  return (
    <div
      id="digital-you-pod"
      className={`relative w-full h-[540px] sm:h-[600px] lg:h-[660px] rounded-2xl bg-zinc-950/80 border transition-all duration-700 overflow-hidden flex flex-col justify-between p-5 backdrop-blur-2xl group ${
        isCompleted
          ? 'border-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.22)] ring-1 ring-emerald-500/30'
          : 'border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:border-zinc-700'
      }`}
    >
      {/* Background Holographic Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b98115_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" />

      {/* Ambient Radial Vignette */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
          isCompleted ? 'opacity-90' : 'opacity-40'
        }`}
      >
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl transition-colors duration-700 ${
            isAsthma
              ? 'bg-sky-500/15'
              : isHeart
              ? 'bg-rose-500/15'
              : 'bg-emerald-500/15'
          }`}
        />
      </div>

      {/* Particle Canvas reacting to exposure */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Top Pod HUD Telemetry Header */}
      <div className="relative z-10 flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              Digital You // Bio-Twin
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
            NODE #BIO-8942 • REAL-TIME CALIBRATION
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono text-zinc-300 flex items-center gap-1.5 shadow-sm">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="capitalize">{userProfile.ageGroup}</span>
          </div>
          <div className={`px-2.5 py-1 rounded-full border text-[10px] font-mono capitalize shadow-sm ${conditionTheme.bg} ${conditionTheme.border} ${conditionTheme.color}`}>
            {userProfile.healthCondition.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Central Viewport: Abstract Futuristic Digital Human Silhouette */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-2 select-none">
        {/* Horizontal Laser Scanning Beam moving vertically */}
        <div className="absolute inset-x-8 h-1 pointer-events-none z-30 animate-bio-scan-sweep">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]" />
          <div className="w-full h-8 -mt-4 bg-gradient-to-b from-emerald-500/10 via-emerald-400/5 to-transparent blur-[2px]" />
        </div>

        {/* Subtle Horizontal CRT Raster Scan Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:100%_4px] pointer-events-none opacity-30 rounded-xl" />

        {/* Target Reticles & Coordinate Overlay */}
        <div className="absolute inset-6 border border-zinc-800/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
          <div className="flex justify-between text-[9px] font-mono text-zinc-600">
            <span>+ 47.1102 N</span>
            <span>GRID: RES-8</span>
            <span>+ 12.4490 E</span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-600">
            <span>CALIB: SYNC</span>
            <div className="w-12 h-[1px] bg-zinc-800" />
            <span>BIO: 98.6%</span>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-zinc-600">
            <span>SYS: RECEPTIVE</span>
            <span>TARGET: {conditionTheme.organ}</span>
            <span>FREQ: 1.2 Hz</span>
          </div>
        </div>

        {/* Outer Rotating Bio-Shield Harmonic Rings */}
        <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-emerald-500/15 pointer-events-none animate-bio-shield-orbit">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
        </div>
        <div className="absolute w-60 h-60 sm:w-68 sm:h-68 rounded-full border border-dashed border-zinc-700/40 pointer-events-none animate-bio-shield-orbit" style={{ animationDirection: 'reverse', animationDuration: '36s' }} />

        {/* SVG Holographic Human Figure */}
        <div className="relative w-48 h-80 sm:w-56 sm:h-96 flex items-center justify-center">
          <svg
            viewBox="0 0 200 360"
            className="w-full h-full overflow-visible transition-all duration-700"
          >
            <defs>
              <linearGradient id="bodyMeshGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#34d399" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#10b981" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.5" />
              </linearGradient>

              <linearGradient id="healthyShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.05" />
              </linearGradient>

              <radialGradient id="lungAuraGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="heartAuraGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#e11d48" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Protective Full-Body Harmonic Shield (Intense when 'healthy') */}
            <ellipse
              cx="100"
              cy="180"
              rx={isHealthy ? '84' : '76'}
              ry={isHealthy ? '170' : '160'}
              fill={isHealthy ? 'url(#healthyShieldGrad)' : 'none'}
              stroke={isHealthy ? '#10b981' : 'rgba(255,255,255,0.08)'}
              strokeWidth={isHealthy ? '2' : '1'}
              strokeDasharray={isHealthy ? 'none' : '4 6'}
              className={isHealthy ? 'animate-bio-shield-pulse' : ''}
            />

            {/* Geometric Vector Silhouette: Head, Torso, Limbs */}
            {/* Cranium / Head */}
            <circle
              cx="100"
              cy="45"
              r="22"
              fill="none"
              stroke="url(#bodyMeshGrad)"
              strokeWidth="2"
              className="drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
            />
            {/* Cranial Neural Node */}
            <circle cx="100" cy="45" r="3" fill="#38bdf8" className="animate-pulse" />
            <circle cx="100" cy="45" r="7" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 3" />

            {/* Neck & Cervical Conduit */}
            <line x1="100" y1="67" x2="100" y2="82" stroke="url(#bodyMeshGrad)" strokeWidth="3" />

            {/* Shoulders & Clavicle Bar */}
            <path
              d="M 60,94 Q 100,80 140,94"
              fill="none"
              stroke="url(#bodyMeshGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Central Torso / Spinal Axis */}
            <line
              x1="100"
              y1="82"
              x2="100"
              y2="195"
              stroke="url(#bodyMeshGrad)"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* Ribcage / Torso Lateral Contours */}
            <path
              d="M 64,95 C 62,130 68,165 76,190"
              fill="none"
              stroke="url(#bodyMeshGrad)"
              strokeWidth="2"
            />
            <path
              d="M 136,95 C 138,130 132,165 124,190"
              fill="none"
              stroke="url(#bodyMeshGrad)"
              strokeWidth="2"
            />

            {/* Horizontal Rib / Biometric Telemetry Rungs */}
            <line x1="72" y1="110" x2="128" y2="110" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <line x1="70" y1="130" x2="130" y2="130" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <line x1="74" y1="150" x2="126" y2="150" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <line x1="78" y1="170" x2="122" y2="170" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

            {/* Arms */}
            {/* Left Arm */}
            <path
              d="M 60,94 Q 48,140 44,190 T 40,240"
              fill="none"
              stroke="url(#bodyMeshGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Right Arm */}
            <path
              d="M 140,94 Q 152,140 156,190 T 160,240"
              fill="none"
              stroke="url(#bodyMeshGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Pelvis Structure */}
            <path
              d="M 76,190 Q 100,205 124,190"
              fill="none"
              stroke="url(#bodyMeshGrad)"
              strokeWidth="2.5"
            />

            {/* Legs */}
            {/* Left Leg */}
            <path
              d="M 82,202 Q 78,260 74,320 T 72,352"
              fill="none"
              stroke="url(#bodyMeshGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Right Leg */}
            <path
              d="M 118,202 Q 122,260 126,320 T 128,352"
              fill="none"
              stroke="url(#bodyMeshGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Knee Joints */}
            <circle cx="76" cy="275" r="3.5" fill="none" stroke="#34d399" strokeWidth="1.5" />
            <circle cx="124" cy="275" r="3.5" fill="none" stroke="#34d399" strokeWidth="1.5" />

            {/* ============================================================ */}
            {/* ANATOMICAL SENSITIVITY OVERLAYS */}
            {/* ============================================================ */}

            {/* 1. RESPIRATORY / LUNG REGION (Chest Center) */}
            <g
              id="bio-lung-region"
              className={isAsthma ? 'animate-bio-lung-breathe' : 'opacity-40'}
              style={{ transformOrigin: '100px 126px' }}
            >
              {/* Diffuse Lung Aura when active */}
              {isAsthma && (
                <ellipse
                  cx="100"
                  cy="126"
                  rx="34"
                  ry="24"
                  fill="url(#lungAuraGrad)"
                  filter="blur(5px)"
                />
              )}

              {/* Left & Right Bronchial Trees */}
              {/* Left Lung Silhouette Path */}
              <path
                d="M 97,112 C 86,112 76,120 78,136 C 80,146 90,146 96,140 Z"
                fill={isAsthma ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.04)'}
                stroke={isAsthma ? '#38bdf8' : 'rgba(255,255,255,0.2)'}
                strokeWidth={isAsthma ? '2' : '1'}
                style={{ filter: isAsthma ? 'drop-shadow(0 0 8px #38bdf8)' : 'none' }}
              />
              {/* Right Lung Silhouette Path */}
              <path
                d="M 103,112 C 114,112 124,120 122,136 C 120,146 110,146 104,140 Z"
                fill={isAsthma ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.04)'}
                stroke={isAsthma ? '#38bdf8' : 'rgba(255,255,255,0.2)'}
                strokeWidth={isAsthma ? '2' : '1'}
                style={{ filter: isAsthma ? 'drop-shadow(0 0 8px #38bdf8)' : 'none' }}
              />

              {/* Bronchial Trachea Branching lines */}
              <line x1="100" y1="106" x2="100" y2="120" stroke={isAsthma ? '#38bdf8' : '#71717a'} strokeWidth="2" />
              <path d="M 100,120 Q 92,126 86,134" fill="none" stroke={isAsthma ? '#38bdf8' : '#71717a'} strokeWidth="1.5" />
              <path d="M 100,120 Q 108,126 114,134" fill="none" stroke={isAsthma ? '#38bdf8' : '#71717a'} strokeWidth="1.5" />

              {/* Glowing Alveolar cluster nodes */}
              {isAsthma && (
                <>
                  <circle cx="84" cy="132" r="2.5" fill="#bae6fd" className="animate-ping" />
                  <circle cx="116" cy="132" r="2.5" fill="#bae6fd" className="animate-ping" />
                  <circle cx="90" cy="140" r="2" fill="#38bdf8" />
                  <circle cx="110" cy="140" r="2" fill="#38bdf8" />
                </>
              )}
            </g>

            {/* 2. CARDIOVASCULAR / HEART REGION (Left of Center Sternum) */}
            <g
              id="bio-heart-region"
              className={isHeart ? 'animate-bio-heart-beat' : 'opacity-40'}
              style={{ transformOrigin: '94px 134px' }}
            >
              {/* Cardiac Aura when active */}
              {isHeart && (
                <circle
                  cx="94"
                  cy="134"
                  r="24"
                  fill="url(#heartAuraGrad)"
                  filter="blur(6px)"
                />
              )}

              {/* Heart Organ Node */}
              <circle
                cx="94"
                cy="134"
                r={isHeart ? '9' : '6'}
                fill={isHeart ? '#f43f5e' : 'rgba(255,255,255,0.08)'}
                stroke={isHeart ? '#fda4af' : 'rgba(255,255,255,0.2)'}
                strokeWidth={isHeart ? '2' : '1'}
                style={{ filter: isHeart ? 'drop-shadow(0 0 12px #f43f5e)' : 'none' }}
              />

              {/* Vascular Aorta Arch */}
              <path
                d="M 94,125 Q 98,118 104,122"
                fill="none"
                stroke={isHeart ? '#f43f5e' : '#71717a'}
                strokeWidth={isHeart ? '2.5' : '1'}
              />

              {/* Heartbeat EKG Pulse Wave overlay */}
              {isHeart && (
                <path
                  d="M 68,134 L 82,134 L 86,124 L 92,144 L 96,128 L 102,138 L 106,134 L 120,134"
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_6px_#f43f5e]"
                />
              )}
            </g>

            {/* Homeostasis Protective Equilibrium Rings when 'healthy' */}
            {isHealthy && (
              <g className="animate-bio-shield-pulse">
                <circle cx="100" cy="130" r="42" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="5 5" opacity="0.6" />
                <circle cx="100" cy="130" r="54" fill="none" stroke="#34d399" strokeWidth="0.75" strokeDasharray="2 8" opacity="0.4" />
                <circle cx="100" cy="130" r="5" fill="#10b981" className="animate-pulse" />
              </g>
            )}
          </svg>
        </div>

        {/* Floating Callout Badge pointing to the active biological node */}
        <div className="absolute right-3 sm:right-6 top-1/4 max-w-[150px] bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 backdrop-blur-xl shadow-lg pointer-events-none transform transition-all duration-500">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-2 h-2 rounded-full ${isAsthma ? 'bg-sky-400' : isHeart ? 'bg-rose-400' : 'bg-emerald-400'} animate-ping`} />
            <span className="text-[9px] font-mono uppercase font-bold text-zinc-300">
              Target Node
            </span>
          </div>
          <p className="text-[11px] font-semibold text-white leading-tight">
            {isAsthma ? 'Bronchial Airway' : isHeart ? 'Cardiovascular Center' : 'Systemic Equilibrium'}
          </p>
          <p className="text-[9px] text-zinc-400 mt-1 font-light leading-snug">
            {isAsthma
              ? 'Hyper-reactive spasm zone on PM2.5 deposition.'
              : isHeart
              ? 'Arterial vasoconstriction sensitivity active.'
              : 'Intact ciliary clearance & immune defense.'}
          </p>
        </div>

        {/* Floating Demographic Indicator Badge on the left */}
        <div className="absolute left-3 sm:left-6 bottom-1/4 max-w-[140px] bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 backdrop-blur-xl shadow-lg pointer-events-none transform transition-all duration-500">
          <span className="text-[9px] font-mono uppercase font-bold text-zinc-400 block mb-1">
            Physio Profile
          </span>
          <p className="text-xs font-semibold text-white capitalize">
            {userProfile.ageGroup} Cohort
          </p>
          <p className="text-[9px] text-zinc-400 mt-0.5">
            {userProfile.ageGroup === 'child'
              ? 'Elevated ventilation/kg'
              : userProfile.ageGroup === 'senior'
              ? 'Alveolar clearance guarded'
              : 'Standard adult baseline'}
          </p>
        </div>
      </div>

      {/* Real-time Signal Notification Ribbon (Shows when user clicks any option) */}
      {recentSignal && (
        <div className="relative z-20 mx-auto -mt-3 mb-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span className="font-bold tracking-wide">{recentSignal.label}</span>
          <span className="text-[10px] text-emerald-400/80">({recentSignal.type})</span>
        </div>
      )}

      {/* Bottom Telemetry HUD: Exposure & Biological Vulnerability Status */}
      <div className="relative z-10 border-t border-zinc-800/80 pt-3 grid grid-cols-2 gap-3">
        {/* Exposure Status */}
        <div className="bg-zinc-900/60 rounded-xl p-2.5 border border-zinc-800/80">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span className="text-zinc-500 uppercase">Exposure Shield</span>
            <span className={`font-semibold ${exposureLevel.color}`}>{exposureLevel.factor}</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1">
            <div className={`h-full rounded-full transition-all duration-500 ${exposureLevel.bar}`} />
          </div>
          <p className="text-[10px] text-zinc-400 truncate">{exposureLevel.label}</p>
        </div>

        {/* Biological Vulnerability Status */}
        <div className="bg-zinc-900/60 rounded-xl p-2.5 border border-zinc-800/80">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span className="text-zinc-500 uppercase">Organ Vulnerability</span>
            <span className={`font-semibold ${conditionTheme.color}`}>
              {isAsthma ? 'High (Lungs)' : isHeart ? 'Guarded (Vascular)' : 'Low (Optimal)'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAsthma
                  ? 'w-4/5 bg-sky-500'
                  : isHeart
                  ? 'w-3/4 bg-rose-500'
                  : 'w-1/5 bg-emerald-500'
              }`}
            />
          </div>
          <p className="text-[10px] text-zinc-400 truncate">{conditionTheme.organ}</p>
        </div>
      </div>

      {/* Completion Overlay Flash */}
      {isCompleted && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-emerald-400/40 animate-bio-completion-glow" />
      )}
    </div>
  );
};

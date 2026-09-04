import React, { useEffect, useRef } from 'react';
import {
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EnvironmentalData, UserProfile, HealthRiskAssessment, WeatherVisualType } from '../types';
import { HeroAtmosphere } from './HeroAtmosphere';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  currentCity: EnvironmentalData;
  userProfile: UserProfile;
  assessment: HealthRiskAssessment;
  isCelsius: boolean;
  onScrollToNext: () => void;
  onNavigate: (sectionId: string) => void;
  weatherOverride?: WeatherVisualType | null;
  onReplayIntro?: () => void;
  theme?: 'light' | 'dark';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  color: string;
  pulseOffset: number;
}

const FLOATING_DATA_NODES = [
  { label: 'ATMOSPHERE // PM2.5: 14.2 µg/m³', top: '18%', left: '8%', parallaxRate: 1.4 },
  { label: 'SOLAR FLUX: UV INDEX 4.2', bottom: '28%', right: '10%', parallaxRate: 1.2 },
  { label: 'AEROSOL OPTICAL DEPTH: 0.18', bottom: '24%', right: '9%', parallaxRate: 1.5 },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentCity,
  userProfile,
  assessment,
  isCelsius,
  onScrollToNext,
  onNavigate,
  weatherOverride,
  onReplayIntro,
  theme = 'dark',
}) => {
  const displayTemp = isCelsius
    ? `${currentCity.temperature}°C`
    : `${Math.round((currentCity.temperature * 9) / 5 + 32)}°F`;

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgGlowRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const snapshotCardRef = useRef<HTMLDivElement>(null);
  const actionButtonsRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  // Mouse Parallax & Cinematic Entry + ScrollTrigger Scrub
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Quick setters for smooth 60fps mouse parallax
    const glowX = gsap.quickTo(bgGlowRef.current, 'x', { duration: 0.8, ease: 'power2.out' });
    const glowY = gsap.quickTo(bgGlowRef.current, 'y', { duration: 0.8, ease: 'power2.out' });
    const particlesX = gsap.quickTo(canvasRef.current, 'x', { duration: 1.1, ease: 'power2.out' });
    const particlesY = gsap.quickTo(canvasRef.current, 'y', { duration: 1.1, ease: 'power2.out' });
    const cardRotateX = gsap.quickTo(snapshotCardRef.current, 'rotateX', { duration: 0.6, ease: 'power2.out' });
    const cardRotateY = gsap.quickTo(snapshotCardRef.current, 'rotateY', { duration: 0.6, ease: 'power2.out' });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1

      glowX(normX * 28);
      glowY(normY * 24);
      particlesX(normX * 18);
      particlesY(normY * 16);
      cardRotateX(-normY * 1.5);
      cardRotateY(normX * 1.5);
    };

    const handleMouseLeave = () => {
      glowX(0);
      glowY(0);
      particlesX(0);
      particlesY(0);
      cardRotateX(0);
      cardRotateY(0);
    };

    section.addEventListener('mousemove', handleMouseMove);
    section.addEventListener('mouseleave', handleMouseLeave);

    // Particle Canvas Simulation
    const canvas = canvasRef.current;
    let animFrameId: number;

    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let width = canvas.parentElement?.clientWidth || window.innerWidth;
        let height = canvas.parentElement?.clientHeight || window.innerHeight;

        const setCanvasSize = () => {
          width = canvas.parentElement?.clientWidth || window.innerWidth;
          height = canvas.parentElement?.clientHeight || window.innerHeight;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        // Generate particle field
        const count = Math.min(16, Math.floor(width / 56));
        const colors = [
          'rgba(255, 92, 77, ',   // Electric Coral
          'rgba(246, 183, 60, ',  // Atmospheric Gold
          'rgba(142, 220, 255, ', // Ice Blue
          'rgba(99, 217, 179, ',  // Soft Mint
        ];

        const particles: Particle[] = Array.from({ length: count }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -Math.random() * 0.4 - 0.1, // subtle upward atmospheric drift
          radius: Math.random() * 1.8 + 0.8,
          baseAlpha: Math.random() * 0.2 + 0.08,
          alpha: Math.random() * 0.4 + 0.15,
          color: colors[Math.floor(Math.random() * colors.length)],
          pulseOffset: Math.random() * Math.PI * 2,
        }));

        let time = 0;
        const renderParticles = () => {
          time += 0.02;
          ctx.clearRect(0, 0, width, height);

          // Draw connections for proximate particles
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 72) {
                const lineAlpha = (1 - dist / 72) * 0.03;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(142, 220, 255, ${lineAlpha})`;
                ctx.lineWidth = 0.6;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }

          // Draw individual floating particles
          particles.forEach((p) => {
            p.x += p.vx + Math.sin(time + p.pulseOffset) * 0.12;
            p.y += p.vy;

            // Wrap edges
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
            if (p.y < -10) p.y = height + 10;
            if (p.y > height + 10) p.y = -10;

            p.alpha = p.baseAlpha + Math.sin(time * 2 + p.pulseOffset) * 0.1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${Math.max(0.05, p.alpha)})`;
            ctx.fill();
          });

          animFrameId = requestAnimationFrame(renderParticles);
        };

        renderParticles();
      }
    }

    // GSAP Animation Context for scoped animations & clean unmount
    const ctx = gsap.context(() => {
      // 1. Initial Page Load Reveal Sequence
      const introTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.15,
      });

      // Stage 1: Ambient atmosphere & system elements fade and glow in
      introTl
        .fromTo(
          bgGlowRef.current,
          { opacity: 0.05, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' },
          0
        )
        .fromTo(
          canvasRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1.6, ease: 'power2.out' },
          0.1
        )
        .fromTo(
          '.hero-system-element',
          { opacity: 0, y: 16, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.85, stagger: 0.08 },
          0.2
        );

      // Stage 2: App title letter-by-letter reveal
      introTl.fromTo(
        '.hero-title-char',
        { y: '115%', opacity: 0, filter: 'blur(8px)' },
        {
          y: '0%',
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.7,
          stagger: 0.035,
          ease: 'power3.out',
        },
        0.45
      );

      // Stage 3: Cinematic headline reveal with staggered lines
      // Line 1: "The environment affects everyone."
      introTl.fromTo(
        '.hero-headline-l1',
        { y: '115%', opacity: 0, filter: 'blur(8px)' },
        {
          y: '0%',
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.85,
          ease: 'power3.out',
        },
        0.8
      );

      // Line 2: "But not everyone the same way."
      // The muted part gradually illuminates into view
      introTl.fromTo(
        '.hero-headline-l2',
        {
          y: '115%',
          opacity: 0,
          filter: 'blur(10px)',
          color: '#18181b', // starts very dark
        },
        {
          y: '0%',
          opacity: 1,
          filter: 'blur(0px)',
          color: '#71717a', // smoothly illuminates to text-zinc-500
          duration: 1.15,
          ease: 'power3.out',
        },
        1.05
      );

      // Stage 4: Subtitle reveal
      introTl.fromTo(
        subtitleRef.current,
        { y: 22, opacity: 0, filter: 'blur(6px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' },
        1.3
      );

      // Stage 5: Environmental telemetry card from below with scale-up and fade-in
      introTl.fromTo(
        snapshotCardRef.current,
        { y: 55, scale: 0.94, opacity: 0, filter: 'blur(8px)' },
        { y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.95, ease: 'power3.out' },
        1.45
      );

      // Micro-stagger telemetry columns inside card
      introTl.fromTo(
        '.hero-snapshot-item',
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
        1.65
      );

      // Stage 6: Action buttons and scroll indicator
      introTl.fromTo(
        actionButtonsRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
        1.8
      );

      introTl.fromTo(
        scrollIndicatorRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        1.95
      );

      // 2. Scroll Transition & Pinning using ScrollTrigger
      // Pins Intro section and gracefully scales down, fades & blurs content while parallaxing background
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=70%',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      scrollTl
        .to(headlineRef.current, {
          scale: 0.88,
          opacity: 0,
          filter: 'blur(12px)',
          y: -50,
          ease: 'power2.inOut',
        }, 0)
        .to(titleRef.current, {
          scale: 0.94,
          opacity: 0,
          filter: 'blur(8px)',
          y: -35,
          ease: 'power2.inOut',
        }, 0)
        .to(taglineRef.current, {
          opacity: 0,
          y: -20,
          ease: 'power2.inOut',
        }, 0)
        .to(subtitleRef.current, {
          opacity: 0,
          filter: 'blur(6px)',
          y: -25,
          ease: 'power2.inOut',
        }, 0.05)
        .to(snapshotCardRef.current, {
          scale: 0.92,
          opacity: 0,
          filter: 'blur(10px)',
          y: -40,
          ease: 'power2.inOut',
        }, 0.05)
        .to(actionButtonsRef.current, {
          opacity: 0,
          y: -20,
          ease: 'power2.inOut',
        }, 0.08)
        .to(scrollIndicatorRef.current, {
          opacity: 0,
          y: -10,
          ease: 'power2.inOut',
        }, 0.05)
        .to(bgGlowRef.current, {
          y: -70,
          opacity: 0.35,
          ease: 'none',
        }, 0)
        .to(canvasRef.current, {
          y: -140,
          opacity: 0.15,
          ease: 'none',
        }, 0)
        .to('.hero-parallax-data', {
          y: -170,
          opacity: 0,
          stagger: 0.04,
          ease: 'none',
        }, 0);

      // Refresh ScrollTrigger after paint
      ScrollTrigger.refresh();
    }, sectionRef);

    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameId) cancelAnimationFrame(animFrameId);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col justify-between items-center px-4 sm:px-8 pt-28 pb-10 overflow-hidden earth-section text-zinc-100 will-change-transform"
      style={{ perspective: '1200px' }}
    >
      {/* Living Atmospheric Weather Environment & Volumetric Layered Clouds */}
      <HeroAtmosphere currentCity={currentCity} weatherOverride={weatherOverride} themeMode={theme} />

      <div className="absolute inset-0 earth-cinematic-wash pointer-events-none z-[1]" />

      {/* Ambient background particles & grid with mouse parallax */}
      <div
        ref={bgGlowRef}
        className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 will-change-transform"
      >
        {/* Dynamic atmospheric radial glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#FF5C4D]/[0.05] rounded-full blur-[160px]" />
        <div className="absolute top-1/3 -left-32 w-[450px] h-[450px] bg-[#F6B73C]/[0.035] rounded-full blur-[160px]" />

        {/* Ambient subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(#F6B73C 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Interactive Micro-Particulate Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-0 will-change-transform"
      />

      {/* Floating Micro Environmental Telemetry Glyphs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden hidden lg:block">
        {FLOATING_DATA_NODES.map((node, i) => (
          <div
            key={i}
            className="hero-parallax-data hero-system-element absolute bg-[#080A16]/60 backdrop-blur-md px-2.5 py-1 text-[9px] font-mono tracking-tighter text-[#8EDCFF]/70 border-l-2 border-[#8EDCFF]/40 animate-float"
            style={{
              top: node.top,
              left: node.left,
              right: node.right,
              bottom: node.bottom,
              animationDelay: `${i * 1.5}s`,
            }}
          >
            {node.label}
          </div>
        ))}
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center my-auto flex flex-col items-center">
        {/* Tagline Badge */}
        <div
          id="hero-tagline-badge"
          ref={taglineRef}
          className="hero-system-element inline-flex items-center gap-2 px-3 py-1 bg-[#151326]/80 backdrop-blur-md border border-white/[0.08] rounded-full text-xs font-mono text-[#C8C3B7] mb-6 opacity-0 will-change-transform"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C4D] animate-pulse" />
          <span className="text-[#F4F1EA]">
            {currentCity.isRealTelemetry ? 'LIVE TELEMETRY' : 'SYSTEM: ACTIVE'} // REGION: {currentCity.location.split(',')[0].toUpperCase()}
          </span>
          <span className="text-[#8A8579]">//</span>
          <span className="text-[#8EDCFF]">
            {currentCity.isRealTelemetry && currentCity.lastUpdated ? currentCity.lastUpdated : 'HEALTH ADVISORY'}
          </span>
        </div>

        {/* App Title with Letter-by-Letter Cinematic Reveal */}
        <h1
          id="hero-app-title"
          ref={titleRef}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#F4F1EA] mb-4 flex items-center justify-center select-none will-change-transform"
          aria-label="AeroCare AI"
        >
          <span className="inline-flex">
            {'AeroCare'.split('').map((char, i) => (
              <span key={`char-ac-${i}`} className="inline-block overflow-hidden py-1">
                <span className="hero-title-char inline-block will-change-transform text-[#F4F1EA]">
                  {char}
                </span>
              </span>
            ))}
          </span>
          <span className="inline-block w-2 sm:w-3.5" />
          <span className="inline-flex text-[#FF5C4D]">
            {'AI'.split('').map((char, i) => (
              <span key={`char-ai-${i}`} className="inline-block overflow-hidden py-1">
                <span className="hero-title-char inline-block text-[#FF5C4D] will-change-transform">
                  {char}
                </span>
              </span>
            ))}
          </span>
        </h1>

        {/* Powerful Headline with Staggered Lines & Gradual Illumination */}
        <h2
          id="hero-headline"
          ref={headlineRef}
          className="text-3xl sm:text-5xl md:text-6xl font-light leading-[1.1] tracking-tight text-[#F4F1EA] max-w-3xl mx-auto mb-6 will-change-transform"
        >
          <span className="block overflow-hidden py-0.5">
            <span className="hero-headline-l1 block will-change-transform">
              The environment affects everyone.
            </span>
          </span>{' '}
          <span className="block sm:inline overflow-hidden py-0.5">
            <span className="hero-headline-l2 block sm:inline text-[#8A8579] will-change-transform">
              But not everyone the same way.
            </span>
          </span>
        </h2>

        {/* Narrative Subtitle */}
        <p
          ref={subtitleRef}
          className="text-sm sm:text-base md:text-lg text-[#C8C3B7] max-w-2xl mx-auto mb-10 leading-relaxed font-light opacity-0 will-change-transform"
        >
          An intelligent physiological guidance engine cross-referencing real-time atmospheric chemistry against personal health vulnerabilities.
        </p>

        {/* Quick Atmospheric Snapshot Widget */}
        <div
          id="hero-snapshot-card"
          ref={snapshotCardRef}
          className="w-full max-w-2xl bg-[#151326]/75 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl mb-10 shadow-[0_18px_60px_rgba(0,0,0,0.35)] relative overflow-hidden opacity-0 will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-[#8A8579] font-bold">
                Current Environment Telemetry
              </span>
              {currentCity.isRealTelemetry && (
                <span className="text-[9px] uppercase tracking-wider font-mono text-[#8EDCFF] bg-[#8EDCFF]/10 px-1.5 py-0.5 rounded border border-[#8EDCFF]/20 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#8EDCFF] animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-[#F6B73C]">
              {currentCity.location}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="hero-snapshot-item flex flex-col">
              <span className="text-2xl sm:text-3xl font-light text-[#F4F1EA]">{displayTemp}</span>
              <span className="text-[10px] uppercase tracking-widest text-[#8A8579] font-bold mt-1">Temperature</span>
            </div>
            <div className="hero-snapshot-item flex flex-col">
              <span className="text-2xl sm:text-3xl font-light text-[#F4F1EA]">{currentCity.humidity}%</span>
              <span className="text-[10px] uppercase tracking-widest text-[#8A8579] font-bold mt-1">Humidity</span>
            </div>
            <div className="hero-snapshot-item flex flex-col">
              <span className={`text-2xl sm:text-3xl font-light ${
                currentCity.aqi <= 50 ? 'text-[#63D9B3]' : currentCity.aqi <= 100 ? 'text-[#F6B73C]' : 'text-[#FF5C4D]'
              }`}>
                {currentCity.aqi} AQI
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#8A8579] font-bold mt-1">Air Quality</span>
            </div>
            <div className="hero-snapshot-item flex flex-col">
              <span className="text-2xl sm:text-3xl font-light text-[#F6B73C]">{currentCity.uvIndex} UV</span>
              <span className="text-[10px] uppercase tracking-widest text-[#8A8579] font-bold mt-1">Solar Index</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          ref={actionButtonsRef}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center opacity-0 will-change-transform"
        >
          <button
            id="hero-start-btn"
            onClick={() => onNavigate('environment')}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FF5C4D] to-[#F6B73C] text-[#080A16] rounded-full text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#FF5C4D]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Explore Environment</span>
            <ChevronRight className="w-4 h-4 text-[#080A16]" />
          </button>

          <button
            id="hero-profile-btn"
            onClick={() => onNavigate('profile')}
            className="w-full sm:w-auto px-8 py-4 bg-[#151326]/80 rounded-full border border-white/15 text-[#F4F1EA] hover:bg-[#1E1B34] hover:border-[#FF5C4D]/40 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-[#FF5C4D]" />
            <span>Calibrate Bio-Profile</span>
          </button>

          {onReplayIntro && (
            <button
              id="hero-replay-intro-btn"
              onClick={onReplayIntro}
              title="Re-experience the cinematic intelligence boot sequence"
              className="w-full sm:w-auto px-6 py-4 bg-[#151326]/90 rounded-full border border-[#F6B73C]/30 text-[#F4F1EA] hover:bg-[#FF5C4D]/15 hover:border-[#FF5C4D]/50 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-[#F6B73C]" />
              <span>Cinematic Intro</span>
            </button>
          )}
        </div>
      </div>

      {/* Clear Visual Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="relative z-10 flex flex-col items-center pt-8 opacity-0 will-change-transform"
      >
        <button
          id="hero-scroll-indicator-btn"
          onClick={onScrollToNext}
          className="group flex items-center gap-3 focus:outline-none cursor-pointer"
          aria-label="Scroll to Environment Section"
        >
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#FF5C4D] transition-colors relative">
            <div className="w-2 h-3.5 border-b-2 border-r-2 border-[#FF5C4D] rotate-45 mb-1 animate-bounce" />
            <div className="absolute inset-0 rounded-full border border-[#FF5C4D]/20 animate-beacon-pulse pointer-events-none" />
          </div>
          <span className="text-xs text-[#8A8579] group-hover:text-[#FF5C4D] uppercase tracking-widest transition-colors font-mono">
            Explore Analysis
          </span>
        </button>
      </div>
    </section>
  );
};

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { EnvironmentalData, WeatherVisualType } from '../types';

interface HeroAtmosphereProps {
  currentCity: EnvironmentalData;
  weatherOverride?: WeatherVisualType | null;
}

interface AtmosphericMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: string;
}

export const HeroAtmosphere: React.FC<HeroAtmosphereProps> = ({
  currentCity,
  weatherOverride,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lightningFlash, setLightningFlash] = useState(0);

  // Derive condition
  const condition: WeatherVisualType = useMemo(() => {
    if (weatherOverride) return weatherOverride;
    if (currentCity.aqi >= 150 || currentCity.weatherCondition === 'Hazy') return 'poor_aqi';
    if (currentCity.weatherCondition === 'Clear' || currentCity.uvIndex >= 7) return 'sunny';
    if (currentCity.weatherCondition === 'Overcast') return 'cloudy';
    if (currentCity.weatherCondition === 'Breezy' || currentCity.windSpeed >= 24) return 'windy';
    return 'cloudy';
  }, [weatherOverride, currentCity]);

  // Smooth mouse parallax lerp
  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const updateParallax = () => {
      curX += (targetX - curX) * 0.055;
      curY += (targetY - curY) * 0.055;
      setMousePos({ x: curX, y: curY });
      rafId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Storm lightning generator
  useEffect(() => {
    if (condition !== 'storm') {
      setLightningFlash(0);
      return;
    }

    let timer: NodeJS.Timeout;
    const triggerLightning = () => {
      setLightningFlash(0.75);
      setTimeout(() => setLightningFlash(0.1), 80);
      setTimeout(() => setLightningFlash(0.6), 160);
      setTimeout(() => setLightningFlash(0), 320);

      const nextInterval = 4000 + Math.random() * 8000;
      timer = setTimeout(triggerLightning, nextInterval);
    };

    timer = setTimeout(triggerLightning, 3000);
    return () => clearTimeout(timer);
  }, [condition]);

  // Micro-particles simulation on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animId: number;
    let frame = 0;

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

    // Generate floating atmospheric moisture & pollen motes
    const windFactor = Math.min(2.8, Math.max(0.45, currentCity.windSpeed / 12));
    const motesCount = condition === 'poor_aqi' ? 65 : condition === 'windy' ? 58 : 45;
    const motes: AtmosphericMote[] = Array.from({ length: motesCount }).map(() => {
      const isWarm = condition === 'sunny' || condition === 'poor_aqi';
      const color = isWarm
        ? Math.random() > 0.4
          ? '245, 158, 11' // Amber
          : '254, 240, 138' // Light warm yellow
        : Math.random() > 0.5
        ? '16, 185, 129' // Emerald
        : '226, 232, 240'; // Soft silver-blue

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45 * windFactor,
        vy: -0.2 - Math.random() * 0.45, // Gentle upward thermal float
        size: 1.0 + Math.random() * 2.2,
        alpha: 0.15 + Math.random() * 0.4,
        baseAlpha: 0.2 + Math.random() * 0.4,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
        color,
      };
    });

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle atmospheric motes
      motes.forEach((m) => {
        m.x += m.vx;
        m.y += m.vy;

        // Gentle Brownian drift
        m.x += Math.sin(frame * 0.02 + m.pulsePhase) * 0.25;

        // Screen wrap
        if (m.y < -10) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;

        const currentAlpha =
          m.baseAlpha + Math.sin(frame * m.pulseSpeed + m.pulsePhase) * 0.18;
        const clampedAlpha = Math.max(0.05, Math.min(0.85, currentAlpha));

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${m.color}, ${clampedAlpha})`;
        ctx.fill();

        // Very soft glow halo around larger motes
        if (m.size > 1.8) {
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${m.color}, ${clampedAlpha * 0.25})`;
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
  }, [condition]);

  // Atmospheric Visual Palette Configuration
  const theme = useMemo(() => {
    switch (condition) {
      case 'sunny':
        return {
          skyGradient: 'from-[#0a1122] via-[#141b2c] to-[#251b14]',
          horizonWarmth: 'from-amber-500/30 via-orange-500/15 to-transparent',
          sunVisible: true,
          sunColor: 'from-amber-200 via-amber-400 to-orange-500',
          rayColor: '#f59e0b',
          cloudFarHighlight: '#94a3b8',
          cloudFarBase: '#172033',
          cloudMidHighlight: '#fbbf24', // Golden sun-kissed crown
          cloudMidShadow: '#131b2b',
          cloudMidDark: '#0b101c',
          cloudForeHighlight: '#f59e0b',
          cloudForeShadow: '#090d16',
          mistHighlight: '#fde68a',
          mistBase: '#1e293b',
          mistOpacity: 0.65,
        };
      case 'cloudy':
        return {
          skyGradient: 'from-[#080d18] via-[#0f1726] to-[#151f30]',
          horizonWarmth: 'from-slate-400/15 via-teal-500/5 to-transparent',
          sunVisible: false,
          sunColor: 'from-slate-200 via-slate-400 to-zinc-500',
          rayColor: '#94a3b8',
          cloudFarHighlight: '#64748b',
          cloudFarBase: '#141d2e',
          cloudMidHighlight: '#94a3b8', // Silvery platinum crown
          cloudMidShadow: '#182236',
          cloudMidDark: '#0d1320',
          cloudForeHighlight: '#64748b',
          cloudForeShadow: '#090e18',
          mistHighlight: '#cbd5e1',
          mistBase: '#0f172a',
          mistOpacity: 0.75,
        };
      case 'rainy':
        return {
          skyGradient: 'from-[#050914] via-[#091220] to-[#0f1a2c]',
          horizonWarmth: 'from-sky-500/20 via-blue-500/10 to-transparent',
          sunVisible: false,
          sunColor: '',
          rayColor: '#38bdf8',
          cloudFarHighlight: '#475569',
          cloudFarBase: '#0f1726',
          cloudMidHighlight: '#64748b',
          cloudMidShadow: '#111927',
          cloudMidDark: '#080d16',
          cloudForeHighlight: '#475569',
          cloudForeShadow: '#060910',
          mistHighlight: '#93c5fd',
          mistBase: '#0f172a',
          mistOpacity: 0.85,
        };
      case 'windy':
        return {
          skyGradient: 'from-[#060c18] via-[#0b1a29] to-[#0e2738]',
          horizonWarmth: 'from-teal-400/25 via-sky-400/10 to-transparent',
          sunVisible: false,
          sunColor: '',
          rayColor: '#2dd4bf',
          cloudFarHighlight: '#5eead4',
          cloudFarBase: '#112233',
          cloudMidHighlight: '#38bdf8',
          cloudMidShadow: '#13283c',
          cloudMidDark: '#0a1724',
          cloudForeHighlight: '#2dd4bf',
          cloudForeShadow: '#071018',
          mistHighlight: '#99f6e4',
          mistBase: '#134e4a',
          mistOpacity: 0.55,
        };
      case 'storm':
        return {
          skyGradient: 'from-[#04040a] via-[#0a0718] to-[#120e24]',
          horizonWarmth: 'from-indigo-600/25 via-purple-600/10 to-transparent',
          sunVisible: false,
          sunColor: '',
          rayColor: '#818cf8',
          cloudFarHighlight: '#6366f1',
          cloudFarBase: '#0d0d1a',
          cloudMidHighlight: '#818cf8',
          cloudMidShadow: '#131126',
          cloudMidDark: '#070611',
          cloudForeHighlight: '#a855f7',
          cloudForeShadow: '#05040d',
          mistHighlight: '#c084fc',
          mistBase: '#1e1b4b',
          mistOpacity: 0.9,
        };
      case 'poor_aqi':
        return {
          skyGradient: 'from-[#140e08] via-[#24150b] to-[#301c10]',
          horizonWarmth: 'from-amber-600/35 via-yellow-600/20 to-transparent',
          sunVisible: true,
          sunColor: 'from-amber-400 via-amber-600 to-amber-800',
          rayColor: '#d97706',
          cloudFarHighlight: '#b45309',
          cloudFarBase: '#26160d',
          cloudMidHighlight: '#d97706',
          cloudMidShadow: '#22130b',
          cloudMidDark: '#120a06',
          cloudForeHighlight: '#92400e',
          cloudForeShadow: '#0c0704',
          mistHighlight: '#fde68a',
          mistBase: '#26160d',
          mistOpacity: 0.95,
        };
    }
  }, [condition]);

  return (
    <div
      id="hero-weather-atmosphere-engine"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      style={{ perspective: '1200px' }}
    >
      {/* 1. Base Atmospheric Skybox Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${theme.skyGradient} transition-all duration-1000`}
      />

      {/* Lightning ambient illumination (Storm) */}
      {condition === 'storm' && (
        <div
          className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-75"
          style={{ opacity: lightningFlash }}
        />
      )}

      {/* 2. Horizon Glow & Atmospheric Haze */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-3/5 bg-gradient-to-t ${theme.horizonWarmth} transition-all duration-1000`}
        style={{
          transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 8}px, 0)`,
        }}
      />

      {/* Thin volumetric light curtains make the horizon feel alive without adding DOM-heavy animation. */}
      <div
        className={`absolute inset-x-0 top-0 h-3/4 atmosphere-light-curtains atmosphere-light-curtains-${condition}`}
        style={{ opacity: condition === 'poor_aqi' ? Math.min(0.9, 0.35 + currentCity.aqi / 300) : 0.55 }}
      />

      {condition === 'poor_aqi' && (
        <div
          className="absolute inset-0 atmosphere-aqi-haze"
          style={{ opacity: Math.min(0.72, 0.2 + currentCity.aqi / 260) }}
        />
      )}

      {/* 3. Slow Atmospheric Light & Sunbeams Source */}
      {theme.sunVisible && (
        <div
          className="absolute top-[8%] right-[15%] pointer-events-none animate-hero-light-sweep"
          style={{
            transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -14}px, 0)`,
          }}
        >
          <div className="relative w-[520px] h-[520px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            {/* Volumetric Radial Sunbeams */}
            <div className="absolute inset-0 animate-sun-rays opacity-30">
              <svg viewBox="0 0 500 500" className="w-full h-full">
                <defs>
                  <radialGradient id="heroSunbeamGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={theme.rayColor} stopOpacity="0.85" />
                    <stop offset="35%" stopColor={theme.rayColor} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={theme.rayColor} stopOpacity="0" />
                  </radialGradient>
                </defs>
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 360) / 12;
                  return (
                    <polygon
                      key={i}
                      points="250,250 205,0 295,0"
                      fill="url(#heroSunbeamGrad)"
                      transform={`rotate(${angle} 250 250)`}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Radiant Solar Corona & Glow */}
            <div
              className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${theme.sunColor} blur-md animate-sun-corona shadow-[0_0_90px_rgba(245,158,11,0.85)]`}
            />
            <div className="absolute w-20 h-20 rounded-full bg-white/95 blur-[2px]" />
            <div className="absolute w-60 h-60 rounded-full bg-amber-400/20 blur-2xl" />
          </div>
        </div>
      )}

      {/* Non-sun volumetric ambient beacon for other conditions */}
      {!theme.sunVisible && (
        <div
          className="absolute top-[12%] right-[22%] w-[450px] h-[450px] rounded-full bg-sky-500/10 blur-[140px] animate-hero-light-sweep pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x * -18}px, ${mousePos.y * -10}px, 0)`,
          }}
        />
      )}

      {/* 4. LAYER 1: Far Background Clouds (Very large, slow, horizontal continuous drift) */}
      <div
        className="absolute top-[4%] left-0 w-[200%] h-[380px] animate-hero-cloud-far pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 6}px, 0)`,
        }}
      >
        <svg
          viewBox="0 0 2000 380"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="farCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.cloudFarHighlight} stopOpacity="0.45" />
              <stop offset="45%" stopColor={theme.cloudFarBase} stopOpacity="0.38" />
              <stop offset="100%" stopColor={theme.cloudFarBase} stopOpacity="0.0" />
            </linearGradient>
            <filter id="farCloudFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>
          {/* Dual identical repeating profile (0-1000px & 1000-2000px) for 100% seamless infinite loop */}
          <path
            d="
              M 0,220 
              C 60,170 140,150 220,180 
              C 300,120 420,110 520,160 
              C 600,100 740,90 840,145 
              C 910,120 970,140 1000,175
              C 1060,170 1140,150 1220,180 
              C 1300,120 1420,110 1520,160 
              C 1600,100 1740,90 1840,145 
              C 1910,120 1970,140 2000,175
              L 2000,380 L 0,380 Z
            "
            fill="url(#farCloudGrad)"
            filter="url(#farCloudFilter)"
          />
        </svg>
      </div>

      {/* 5. LAYER 2: Middle Cloud Layer (Clearly visible, volumetric billowing cumulus bank, drifts + floats) */}
      <div
        className="absolute top-[18%] left-0 w-[200%] h-[480px] animate-hero-cloud-mid pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(${mousePos.x * 24}px, ${mousePos.y * 14}px, 0)`,
        }}
      >
        {/* Inner container handles slight vertical sinusoidal bobbing / floating */}
        <div className="w-full h-full animate-hero-cloud-float">
          <svg
            viewBox="0 0 2400 480"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Volumetric Multi-Stop Gradients */}
              <linearGradient id="midCloudLobeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={theme.cloudMidHighlight} stopOpacity="0.82" />
                <stop offset="30%" stopColor={theme.cloudMidShadow} stopOpacity="0.88" />
                <stop offset="75%" stopColor={theme.cloudMidDark} stopOpacity="0.82" />
                <stop offset="100%" stopColor="#050505" stopOpacity="0.1" />
              </linearGradient>

              {/* Secondary internal depth gradient */}
              <radialGradient id="midCloudPuffGlow" cx="40%" cy="25%" r="65%">
                <stop offset="0%" stopColor={theme.cloudMidHighlight} stopOpacity="0.75" />
                <stop offset="45%" stopColor={theme.cloudMidShadow} stopOpacity="0.65" />
                <stop offset="100%" stopColor={theme.cloudMidDark} stopOpacity="0.0" />
              </radialGradient>

              <filter id="midCloudSoft" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
            </defs>

            {/* Seamless 2-tile path (0-1200px and 1200-2400px) */}
            {/* Tile 1 & 2 Main Volumetric Cumulus Body */}
            <path
              d="
                M 0,330 
                C 70,270 130,220 220,240 
                C 290,160 410,130 520,180 
                C 590,120 710,100 820,150 
                C 900,90 1020,95 1110,160 
                C 1160,140 1200,160 1200,210
                C 1270,270 1330,220 1420,240 
                C 1490,160 1610,130 1720,180 
                C 1790,120 1910,100 2020,150 
                C 2100,90 2220,95 2310,160 
                C 2360,140 2400,160 2400,210
                L 2400,480 L 0,480 Z
              "
              fill="url(#midCloudLobeGrad)"
              filter="url(#midCloudSoft)"
            />

            {/* Internal Billowing Cumulus Highlights (Puff crowns that give cauliflower volume) */}
            <g filter="url(#midCloudSoft)">
              {/* Tile 1 Puffs */}
              <circle cx="360" cy="180" r="105" fill="url(#midCloudPuffGlow)" />
              <circle cx="650" cy="150" r="120" fill="url(#midCloudPuffGlow)" />
              <circle cx="960" cy="135" r="115" fill="url(#midCloudPuffGlow)" />
              <circle cx="180" cy="240" r="85" fill="url(#midCloudPuffGlow)" />

              {/* Tile 2 Puffs (Identical offset by +1200px) */}
              <circle cx="1560" cy="180" r="105" fill="url(#midCloudPuffGlow)" />
              <circle cx="1850" cy="150" r="120" fill="url(#midCloudPuffGlow)" />
              <circle cx="2160" cy="135" r="115" fill="url(#midCloudPuffGlow)" />
              <circle cx="1380" cy="240" r="85" fill="url(#midCloudPuffGlow)" />
            </g>
          </svg>
        </div>
      </div>

      {/* 6. LAYER 3: Foreground Clouds (Larger, closer, soft lens blur, faster drift for strong parallax) */}
      <div
        className="absolute top-[32%] left-0 w-[200%] h-[560px] animate-hero-cloud-fore pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(${mousePos.x * 48}px, ${mousePos.y * 24}px, 0)`,
          filter: 'blur(16px)',
        }}
      >
        <svg
          viewBox="0 0 2400 560"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="foreCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.cloudForeHighlight} stopOpacity="0.55" />
              <stop offset="35%" stopColor={theme.cloudForeShadow} stopOpacity="0.75" />
              <stop offset="85%" stopColor="#050505" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          {/* Sweeping large foreground cloud mass (0-1200px & 1200-2400px) */}
          <path
            d="
              M 0,380 
              C 120,310 240,260 380,290 
              C 520,210 680,180 840,250 
              C 980,190 1120,230 1200,310
              C 1320,310 1440,260 1580,290 
              C 1720,210 1880,180 2040,250 
              C 2180,190 2320,230 2400,310
              L 2400,560 L 0,560 Z
            "
            fill="url(#foreCloudGrad)"
          />
        </svg>
      </div>

      {/* 7. Drifting Rolling Ground Mist & Horizon Fog */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[340px] pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(${mousePos.x * 28}px, ${mousePos.y * 14}px, 0)`,
          opacity: theme.mistOpacity,
        }}
      >
        {/* Continuous Horizontal Mist Wave */}
        <div className="absolute inset-0 w-[200%] animate-hero-mist-drift">
          <div className="w-full h-full animate-hero-mist-swell">
            <svg
              viewBox="0 0 2000 340"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="heroMistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={theme.mistHighlight} stopOpacity="0.32" />
                  <stop offset="45%" stopColor={theme.mistBase} stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#050505" stopOpacity="0.95" />
                </linearGradient>
                <filter id="mistBlur" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="12" />
                </filter>
              </defs>
              <path
                d="
                  M 0,160 
                  Q 250,80 500,130 
                  T 1000,100 
                  Q 1250,80 1500,130 
                  T 2000,100 
                  L 2000,340 L 0,340 Z
                "
                fill="url(#heroMistGrad)"
                filter="url(#mistBlur)"
              />
            </svg>
          </div>
        </div>

        {/* Gradient fade to pitch floor #050505 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
      </div>

      {/* 8. Tiny Floating Particles Canvas (Micro moisture & atmospheric motes) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 will-change-transform"
        style={{
          transform: `translate3d(${mousePos.x * 35}px, ${mousePos.y * 18}px, 0)`,
        }}
      />

      {/* 9. Optical Scrim & Contrast Shield */}
      {/* Ensures the Hero headline, subtext, badges, and cards remain 100% sharp and readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(5,5,5,0.42) 0%, rgba(5,5,5,0.2) 50%, rgba(5,5,5,0.65) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-transparent to-[#050505]/80 pointer-events-none" />
    </div>
  );
};

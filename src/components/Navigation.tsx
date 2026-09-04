import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Wind,
  ShieldAlert,
  Calendar,
  Activity,
  Sliders,
  TrendingUp,
  MapPin,
  ChevronDown,
  Search,
  Compass,
  Loader2,
  X,
  Radio,
  Sparkles,
  Menu,
  RotateCcw
} from 'lucide-react';
import { EnvironmentalData, UserProfile, LocationSearchResult } from '../types';
import { CITIES } from '../data/mockData';
import { searchGlobalLocations } from '../services/environmentalService';

interface NavigationProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  currentCity: EnvironmentalData;
  onSelectCity: (city: EnvironmentalData) => void;
  userProfile: UserProfile;
  isCelsius: boolean;
  onToggleTempUnit: () => void;
  isLoadingTelemetry?: boolean;
  onSelectCoordinates?: (lat: number, lon: number, locationName: string, countryName?: string) => Promise<void>;
  onUseMyLocation?: () => Promise<void>;
  telemetryStatusMessage?: string | null;
  onReplayIntro?: () => void;
  onOpenLocationOnboarding?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  onNavigate,
  currentCity,
  onSelectCity,
  userProfile,
  isCelsius,
  onToggleTempUnit,
  isLoadingTelemetry = false,
  onSelectCoordinates,
  onUseMyLocation,
  telemetryStatusMessage,
  onReplayIntro,
  onOpenLocationOnboarding
}) => {
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: 'hero', label: 'Intro', shortLabel: 'Intro', icon: Sparkles },
    { id: 'environment', label: 'Atmosphere', shortLabel: 'Atmo', icon: Wind },
    { id: 'profile', label: 'Bio Profile', shortLabel: 'Bio', icon: Sliders },
    { id: 'analysis', label: 'AI Synthesis', shortLabel: 'AI', icon: Activity },
    { id: 'risk', label: 'Health Risk', shortLabel: 'Risk', icon: ShieldAlert },
    { id: 'plan', label: 'Daily Plan', shortLabel: 'Plan', icon: Calendar },
    { id: 'trends', label: 'Trends', shortLabel: 'Trends', icon: TrendingUp },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCityMenuOpen(false);
      }
    };
    if (cityMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cityMenuOpen]);

  // Focus search input when menu opens
  useEffect(() => {
    if (cityMenuOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [cityMenuOpen]);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchGlobalLocations(searchQuery, controller.signal);
        setSearchResults(results);
      } catch (err) {
        console.warn('Search query error', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSelectSearchResult = async (result: LocationSearchResult) => {
    if (onSelectCoordinates) {
      await onSelectCoordinates(result.latitude, result.longitude, result.name, result.country);
    }
    setCityMenuOpen(false);
  };

  const handleMyLocationClick = async () => {
    if (onUseMyLocation) {
      await onUseMyLocation();
      setCityMenuOpen(false);
    }
  };

  const handleSectionClick = (sectionId: string) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#080A16]/85 backdrop-blur-xl border-b border-white/[0.06] transition-all duration-300">
      {/* Subtle atmospheric light line beneath header */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF5C4D]/35 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
        {/* =========================================================================
            1. LEFT → BRAND AREA
            Clean, editorial, no bulky container borders.
        ========================================================================= */}
        <button
          id="nav-brand-btn"
          onClick={() => handleSectionClick('hero')}
          className="flex items-center gap-3 group focus:outline-none cursor-pointer text-left shrink-0"
        >
          {/* Solar Eclipse Celestial Mark */}
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5C4D] via-[#F6B73C] to-[#FF5C4D] p-[1.5px] transition-transform duration-300 group-hover:scale-105 shadow-[0_0_14px_rgba(255,92,77,0.3)]">
            <div className="w-full h-full rounded-full bg-[#080A16] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5C4D]/25 to-transparent opacity-80" />
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#FF5C4D] to-[#F6B73C] shadow-[0_0_8px_rgba(255,92,77,0.85)]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-sm tracking-[0.14em] font-bold text-[#F4F1EA] group-hover:text-white transition-colors uppercase">
                AeroCare
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF5C4D] px-1 py-0.5 rounded bg-[#FF5C4D]/10 border border-[#FF5C4D]/20">
                AI
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  currentCity.isRealTelemetry
                    ? 'bg-[#8EDCFF] shadow-[0_0_6px_#8EDCFF]'
                    : 'bg-[#63D9B3] shadow-[0_0_6px_#63D9B3]'
                } animate-pulse`}
              />
              <span className="text-[9px] font-mono tracking-widest text-[#8A8579] uppercase">
                {currentCity.isRealTelemetry ? 'Live Telemetry' : 'Station Active'}
              </span>
            </div>
          </div>
        </button>

        {/* =========================================================================
            2. CENTER → PRIMARY STORY NAVIGATION TIMELINE
            Apple-level simplicity + futuristic instrument. Uncluttered, generous breathing
            room, with one signature active treatment.
        ========================================================================= */}
        <nav
          id="main-nav-pill"
          aria-label="Story sections navigation"
          className="hidden md:flex items-center gap-1 lg:gap-2 px-2 py-1 relative"
        >
          {navItems.map((item, idx) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleSectionClick(item.id)}
                className={`relative px-3 py-1.5 text-xs font-mono transition-colors duration-200 cursor-pointer flex items-center gap-1.5 rounded-full ${
                  isActive
                    ? 'text-[#F4F1EA] font-semibold'
                    : 'text-[#8A8579] hover:text-[#F4F1EA]'
                }`}
              >
                {/* Unified Sliding Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 rounded-full bg-white/[0.07] border border-[#FF5C4D]/40 shadow-[0_0_12px_rgba(255,92,77,0.2)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}

                {/* Section Index Marker */}
                <span
                  className={`relative z-10 text-[9px] font-mono transition-colors ${
                    isActive ? 'text-[#FF5C4D] font-bold' : 'text-[#8A8579]/60'
                  }`}
                >
                  0{idx + 1}
                </span>

                {/* Section Title */}
                <span className="relative z-10 font-sans tracking-wide uppercase text-[11px]">
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden">{item.shortLabel}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* =========================================================================
            3. RIGHT → CONSOLIDATED SCIENTIFIC INSTRUMENT CONTROLS
            No row of 4-5 disconnected floating pills. Grouped cleanly by function.
        ========================================================================= */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Replay Cinematic Intro - Subtle icon button */}
          {onReplayIntro && (
            <button
              id="nav-replay-intro-btn"
              onClick={onReplayIntro}
              title="Replay Opening Sequence"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A8579] hover:text-[#F6B73C] hover:bg-white/[0.05] transition-colors cursor-pointer"
              aria-label="Replay intro sequence"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Location Selector Dropdown Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="nav-city-select-btn"
              onClick={() => setCityMenuOpen(!cityMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs text-[#F4F1EA] hover:bg-white/[0.06] transition-colors cursor-pointer border border-transparent hover:border-white/10"
              title="Select or search location"
            >
              {isLoadingTelemetry ? (
                <Loader2 className="w-3.5 h-3.5 text-[#F6B73C] animate-spin" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-[#FF5C4D]" />
              )}
              <span className="font-medium max-w-[85px] sm:max-w-[120px] truncate text-[12px] sm:text-[13px]">
                {currentCity.location.split(',')[0]}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-[#8A8579] transition-transform duration-200 ${
                  cityMenuOpen ? 'rotate-180 text-[#FF5C4D]' : ''
                }`}
              />
            </button>

            {/* City Dropdown Menu */}
            {cityMenuOpen && (
              <div
                id="nav-city-dropdown"
                className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#151326]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Geolocation Trigger */}
                <button
                  id="nav-use-my-location-btn"
                  onClick={handleMyLocationClick}
                  disabled={isLoadingTelemetry}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-[#FF5C4D]/10 hover:bg-[#FF5C4D]/20 border border-[#FF5C4D]/30 text-[#FF5C4D] font-medium transition-colors cursor-pointer group mb-2.5"
                >
                  <div className="flex items-center gap-2">
                    {isLoadingTelemetry ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F6B73C]" />
                    ) : (
                      <Compass className="w-3.5 h-3.5 text-[#FF5C4D] group-hover:rotate-45 transition-transform duration-300" />
                    )}
                    <span>Use My Current Location</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#F6B73C] bg-[#F6B73C]/15 px-1.5 py-0.5 rounded border border-[#F6B73C]/20">
                    GPS
                  </span>
                </button>

                {/* Search Bar */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-[#8A8579] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search global city or region..."
                    className="w-full bg-[#080A16] border border-white/10 rounded-xl pl-8 pr-7 py-1.5 text-xs text-[#F4F1EA] placeholder-[#8A8579] focus:outline-none focus:border-[#FF5C4D]/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8579] hover:text-[#F4F1EA]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Status Message */}
                {telemetryStatusMessage && (
                  <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] leading-tight">
                    {telemetryStatusMessage}
                  </div>
                )}

                {/* Search Results */}
                {searchQuery.trim().length >= 2 && (
                  <div className="mb-2.5 pb-2.5 border-b border-white/[0.08]">
                    <div className="px-1 py-1 text-[10px] uppercase font-bold tracking-widest text-[#8A8579] flex items-center justify-between">
                      <span>Global Search Results</span>
                      {isSearching && <Loader2 className="w-3 h-3 animate-spin text-[#F6B73C]" />}
                    </div>

                    {isSearching && searchResults.length === 0 && (
                      <div className="py-3 text-center text-xs text-[#8A8579]">
                        Querying atmospheric telemetry...
                      </div>
                    )}

                    {!isSearching && searchResults.length === 0 && (
                      <div className="py-2.5 text-center text-xs text-[#8A8579]">
                        No locations found for &ldquo;{searchQuery}&rdquo;
                      </div>
                    )}

                    <div className="py-0.5 max-h-44 overflow-y-auto space-y-1">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.id}-${result.latitude}-${result.longitude}`}
                          onClick={() => handleSelectSearchResult(result)}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between text-[#C8C3B7] hover:bg-white/5 hover:text-[#F4F1EA] transition-colors cursor-pointer group"
                        >
                          <div className="truncate pr-2">
                            <p className="font-medium text-[#F4F1EA] group-hover:text-[#FF5C4D] truncate">
                              {result.name}
                            </p>
                            <p className="text-[10px] text-[#8A8579] truncate">
                              {[result.admin1, result.country].filter(Boolean).join(', ')}
                            </p>
                          </div>
                          <Radio className="w-3 h-3 text-[#8A8579] group-hover:text-[#8EDCFF] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preset Stations */}
                <div>
                  <div className="px-1 py-1 text-[10px] uppercase font-bold tracking-widest text-[#8A8579] flex items-center justify-between">
                    <span>Preset Telemetry Stations</span>
                  </div>
                  <div className="py-0.5 max-h-48 overflow-y-auto space-y-0.5">
                    {CITIES.map((c) => {
                      const isSelected = c.location === currentCity.location;
                      return (
                        <button
                          key={c.location}
                          id={`city-option-${c.location.replace(/[^a-zA-Z0-9]/g, '-')}`}
                          onClick={() => {
                            onSelectCity(c);
                            setCityMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#FF5C4D]/15 text-[#F4F1EA] font-semibold border border-[#FF5C4D]/30'
                              : 'text-[#C8C3B7] hover:bg-white/5'
                          }`}
                        >
                          <div>
                            <p className="font-medium">{c.location}</p>
                            <p className="text-[10px] text-[#8A8579]">{c.country}</p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                c.aqi <= 50
                                  ? 'bg-[#63D9B3]/20 text-[#63D9B3]'
                                  : c.aqi <= 100
                                  ? 'bg-[#F6B73C]/20 text-[#F6B73C]'
                                  : 'bg-[#FF5C4D]/20 text-[#FF5C4D]'
                              }`}
                            >
                              AQI {c.aqi}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location Calibration Sequence Launcher */}
                {onOpenLocationOnboarding && (
                  <div className="pt-2 mt-2 border-t border-white/10">
                    <button
                      id="nav-launch-calibration-btn"
                      onClick={() => {
                        setCityMenuOpen(false);
                        onOpenLocationOnboarding();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-mono text-[#8EDCFF] hover:bg-[#8EDCFF]/10 transition-colors cursor-pointer border border-[#8EDCFF]/20"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Calibrate Location & Sensors</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Temperature Unit Toggle Button */}
          <button
            id="nav-temp-unit-toggle"
            onClick={onToggleTempUnit}
            title="Toggle Celsius / Fahrenheit"
            className="px-2 py-1.5 rounded-lg text-xs font-mono font-medium text-[#F6B73C] hover:text-[#FF5C4D] hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            {isCelsius ? '°C' : '°F'}
          </button>

          {/* User Bio-Profile Quick Jump */}
          <button
            id="nav-profile-pill-btn"
            onClick={() => handleSectionClick('profile')}
            title="Biological Profile & Telemetry Calibration"
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#F4F1EA] hover:bg-white/[0.06] transition-colors cursor-pointer group border border-transparent hover:border-white/10"
          >
            <div className="w-5 h-5 rounded-full bg-[#FF5C4D]/10 border border-[#FF5C4D]/30 flex items-center justify-center">
              <Sliders className="w-2.5 h-2.5 text-[#FF5C4D]" />
            </div>
            <span className="capitalize text-xs font-medium text-[#C8C3B7] group-hover:text-[#F4F1EA]">
              {userProfile.healthCondition === 'heart_condition' ? 'Cardiac' : userProfile.healthCondition}
            </span>
          </button>

          {/* Mobile Drawer Menu Toggle (Only visible on small screens) */}
          <button
            id="nav-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#F4F1EA] hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Toggle story menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-[#FF5C4D]" />
            ) : (
              <Menu className="w-4 h-4 text-[#C8C3B7]" />
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. MOBILE STORY DRAWER
          Collapsible panel on mobile viewports for effortless 1-tap navigation.
      ========================================================================= */}
      {mobileMenuOpen && (
        <div
          id="nav-mobile-drawer"
          className="md:hidden bg-[#080A16]/95 backdrop-blur-2xl border-b border-white/10 px-4 py-3 space-y-2.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A8579] px-1">
            Story Sequence Timeline
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navItems.map((item, idx) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#FF5C4D]/15 text-[#F4F1EA] font-semibold border border-[#FF5C4D]/30'
                      : 'text-[#C8C3B7] hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-[#FF5C4D] font-bold' : 'text-[#8A8579]'}>
                      0{idx + 1}
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF5C4D]' : 'text-[#8A8579]'}`} />
                    <span className="font-sans font-medium text-xs tracking-wide uppercase">
                      {item.label}
                    </span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C4D] shadow-[0_0_6px_#FF5C4D]" />}
                </button>
              );
            })}
          </div>

          {/* Quick Profile Jump in Mobile Drawer */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between px-1">
            <span className="text-[11px] font-mono text-[#8A8579]">Bio Profile:</span>
            <button
              onClick={() => handleSectionClick('profile')}
              className="flex items-center gap-1.5 text-xs text-[#FF5C4D] font-medium"
            >
              <span className="capitalize">
                {userProfile.healthCondition === 'heart_condition' ? 'Cardiac' : userProfile.healthCondition}
              </span>
              <span className="text-[#8A8579]">({userProfile.ageGroup})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

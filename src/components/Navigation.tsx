import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  ChevronDown,
  Search,
  Compass,
  Loader2,
  X,
  Radio,
  RotateCcw,
  Sliders,
  Sun,
  Moon,
} from 'lucide-react';
import { EnvironmentalData, UserProfile, LocationSearchResult, ThemeMode } from '../types';
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
  theme: ThemeMode;
  onToggleTheme: () => void;
  isLoadingTelemetry?: boolean;
  onSelectCoordinates?: (lat: number, lon: number, locationName: string, countryName?: string) => Promise<void>;
  onUseMyLocation?: () => Promise<void>;
  telemetryStatusMessage?: string | null;
  onReplayIntro?: () => void;
  onOpenLocationOnboarding?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeSection: _activeSection,
  onNavigate,
  currentCity,
  onSelectCity,
  userProfile,
  isCelsius,
  onToggleTempUnit,
  theme,
  onToggleTheme,
  isLoadingTelemetry = false,
  onSelectCoordinates,
  onUseMyLocation,
  telemetryStatusMessage,
  onReplayIntro,
  onOpenLocationOnboarding
}) => {
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const isLight = theme === 'light';

  return (
    <header
      id="main-app-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl border-b ${
        isLight
          ? 'bg-[#F8F7F4]/90 border-black/[0.07] text-[#1C1A24] shadow-[0_2px_16px_rgba(0,0,0,0.03)]'
          : 'bg-[#080A16]/85 border-white/[0.06] text-[#F4F1EA]'
      }`}
    >
      {/* Subtle atmospheric light line beneath header */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none transition-opacity duration-300 ${
          isLight
            ? 'bg-gradient-to-r from-transparent via-[#FF5C4D]/25 to-transparent'
            : 'bg-gradient-to-r from-transparent via-[#FF5C4D]/35 to-transparent'
        }`}
      />

      <div className="max-w-7xl mx-auto h-16 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        {/* =========================================================================
            1. LEFT → BRAND & LIVE TELEMETRY STATUS
            Clean, editorial, uncluttered.
        ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            id="nav-brand-btn"
            onClick={() => onNavigate('hero')}
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none cursor-pointer text-left"
            title="AeroCare AI Home"
          >
            {/* Solar Eclipse Celestial Mark */}
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5C4D] via-[#F6B73C] to-[#FF5C4D] p-[1.5px] transition-transform duration-300 group-hover:scale-105 shadow-[0_0_12px_rgba(255,92,77,0.3)]">
              <div
                className={`w-full h-full rounded-full flex items-center justify-center relative overflow-hidden transition-colors duration-300 ${
                  isLight ? 'bg-[#F8F7F4]' : 'bg-[#080A16]'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5C4D]/20 to-transparent" />
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#FF5C4D] to-[#F6B73C] shadow-[0_0_8px_rgba(255,92,77,0.9)]" />
              </div>
            </div>

            {/* App Brand Identity */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 leading-none">
                <span
                  className={`text-sm tracking-[0.14em] font-bold transition-colors uppercase ${
                    isLight ? 'text-[#1C1A24] group-hover:text-black' : 'text-[#F4F1EA] group-hover:text-white'
                  }`}
                >
                  AeroCare
                </span>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF5C4D] px-1 py-0.5 rounded bg-[#FF5C4D]/10 border border-[#FF5C4D]/20">
                  AI
                </span>
              </div>
            </div>
          </button>

          {/* Vertical Divider */}
          <div
            className={`hidden xs:block h-4 w-[1px] transition-colors ${
              isLight ? 'bg-black/10' : 'bg-white/10'
            }`}
          />

          {/* Small LIVE TELEMETRY status indicator */}
          <div
            id="nav-telemetry-status"
            className="flex items-center gap-1.5 py-1"
            title={
              telemetryStatusMessage ||
              (currentCity.isRealTelemetry
                ? `Live telemetry active for ${currentCity.location}`
                : 'Synthetic reference telemetry')
            }
          >
            <span
              className={`w-2 h-2 rounded-full transition-colors animate-pulse ${
                currentCity.isRealTelemetry
                  ? 'bg-[#8EDCFF] shadow-[0_0_8px_#8EDCFF]'
                  : 'bg-[#63D9B3] shadow-[0_0_8px_#63D9B3]'
              }`}
            />
            <span
              className={`text-[9px] sm:text-[10px] font-mono tracking-wider uppercase truncate max-w-[90px] sm:max-w-[130px] font-medium transition-colors ${
                isLight ? 'text-[#524F5E]' : 'text-[#8A8579]'
              }`}
            >
              {currentCity.isRealTelemetry ? 'Live Telemetry' : 'Station Active'}
            </span>
          </div>
        </div>

        {/* =========================================================================
            2. CENTER → GENEROUS BREATHING SPACE
            (Numbered navigation items 01-07 are removed for a cinematic, clean look)
        ========================================================================= */}
        <div className="flex-1" />

        {/* =========================================================================
            3. RIGHT → CONTROLS & INSTRUMENTS
            Location, Temperature Unit, Bio Profile, Theme Toggle
        ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Current Location Selector & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="nav-city-select-btn"
              onClick={() => setCityMenuOpen(!cityMenuOpen)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs transition-all duration-200 cursor-pointer border ${
                cityMenuOpen
                  ? isLight
                    ? 'bg-black/[0.06] border-black/15 text-[#1C1A24]'
                    : 'bg-white/10 border-white/20 text-[#F4F1EA]'
                  : isLight
                  ? 'bg-black/[0.03] hover:bg-black/[0.06] border-black/[0.08] text-[#1C1A24]'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] text-[#F4F1EA]'
              }`}
              title="Select or search live atmospheric telemetry location"
              aria-expanded={cityMenuOpen}
            >
              {isLoadingTelemetry ? (
                <Loader2 className="w-3.5 h-3.5 text-[#F6B73C] animate-spin shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-[#FF5C4D] shrink-0" />
              )}
              <span className="font-medium max-w-[80px] sm:max-w-[130px] truncate text-xs">
                {currentCity.location.split(',')[0]}
              </span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 shrink-0 ${
                  cityMenuOpen
                    ? 'rotate-180 text-[#FF5C4D]'
                    : isLight
                    ? 'text-[#7E798A]'
                    : 'text-[#8A8579]'
                }`}
              />
            </button>

            {/* Location Search Dropdown Panel */}
            <AnimatePresence>
              {cityMenuOpen && (
                <motion.div
                  id="nav-city-dropdown"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl backdrop-blur-2xl border p-3 z-50 shadow-2xl ${
                    isLight
                      ? 'bg-white/95 border-black/10 text-[#1C1A24]'
                      : 'bg-[#151326]/95 border-white/10 text-[#F4F1EA]'
                  }`}
                >
                  {/* GPS Location Button */}
                  {onUseMyLocation && (
                    <button
                      id="nav-use-my-location-btn"
                      onClick={handleMyLocationClick}
                      disabled={isLoadingTelemetry}
                      className={`w-full mb-2.5 flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer border ${
                        isLight
                          ? 'bg-[#E84534]/10 hover:bg-[#E84534]/15 border-[#E84534]/25 text-[#E84534]'
                          : 'bg-[#FF5C4D]/10 hover:bg-[#FF5C4D]/20 border-[#FF5C4D]/20 text-[#FF5C4D]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isLoadingTelemetry ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Compass className="w-3.5 h-3.5" />
                        )}
                        <span>Use My Live Location (GPS)</span>
                      </span>
                      <span className="text-[10px] font-mono opacity-70">AUTO</span>
                    </button>
                  )}

                  {/* Search Input */}
                  <div className="relative mb-2.5">
                    <Search
                      className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${
                        isLight ? 'text-[#7E798A]' : 'text-[#8A8579]'
                      }`}
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search any global city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full border rounded-xl pl-8 pr-7 py-1.5 text-xs transition-colors focus:outline-none focus:border-[#FF5C4D]/60 ${
                        isLight
                          ? 'bg-[#F4F1EA] border-black/10 text-[#1C1A24] placeholder-[#7E798A]'
                          : 'bg-[#080A16] border-white/10 text-[#F4F1EA] placeholder-[#8A8579]'
                      }`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className={`absolute right-2 top-2 p-0.5 rounded cursor-pointer ${
                          isLight
                            ? 'text-[#7E798A] hover:text-[#1C1A24]'
                            : 'text-[#8A8579] hover:text-white'
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Live Search Results */}
                  {isSearching && (
                    <div
                      className={`py-3 text-center text-xs flex items-center justify-center gap-2 ${
                        isLight ? 'text-[#7E798A]' : 'text-[#8A8579]'
                      }`}
                    >
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5C4D]" />
                      <span>Scanning meteorological telemetry...</span>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="mb-2 max-h-48 overflow-y-auto space-y-1">
                      <div
                        className={`text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider ${
                          isLight ? 'text-[#7E798A]' : 'text-[#8A8579]'
                        }`}
                      >
                        Global Search Results
                      </div>
                      {searchResults.map((result) => (
                        <button
                          key={`${result.id}-${result.latitude}-${result.longitude}`}
                          onClick={() => handleSelectSearchResult(result)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isLight
                              ? 'text-[#1C1A24] hover:bg-black/[0.05]'
                              : 'text-[#F4F1EA] hover:bg-white/5'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-medium">{result.name}</span>
                            <span
                              className={`text-[11px] ml-1.5 ${
                                isLight ? 'text-[#7E798A]' : 'text-[#8A8579]'
                              }`}
                            >
                              {result.admin1 ? `${result.admin1}, ` : ''}
                              {result.country}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#8EDCFF] ml-2 shrink-0">
                            LIVE API
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Preset Telemetry Stations */}
                  {searchResults.length === 0 && !isSearching && (
                    <div className="space-y-0.5">
                      <div
                        className={`text-[10px] font-mono px-2 py-1 uppercase tracking-wider ${
                          isLight ? 'text-[#7E798A]' : 'text-[#8A8579]'
                        }`}
                      >
                        Preset Telemetry Stations
                      </div>
                      <div className="max-h-44 overflow-y-auto space-y-0.5 pr-0.5">
                        {CITIES.map((city) => {
                          const isSelected = currentCity.location === city.location;
                          return (
                            <button
                              key={city.location}
                              onClick={() => {
                                onSelectCity(city);
                                setCityMenuOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#FF5C4D]/15 text-[#FF5C4D] font-semibold border border-[#FF5C4D]/30'
                                  : isLight
                                  ? 'text-[#4C485A] hover:bg-black/5 hover:text-[#1C1A24]'
                                  : 'text-[#C8C3B7] hover:bg-white/5 hover:text-[#F4F1EA]'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Radio
                                  className={`w-3 h-3 shrink-0 ${
                                    isSelected
                                      ? 'text-[#FF5C4D]'
                                      : isLight
                                      ? 'text-[#7E798A]'
                                      : 'text-[#8A8579]'
                                  }`}
                                />
                                <span className="truncate">{city.location}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 ml-2 font-mono text-[11px]">
                                <span
                                  className={
                                    city.aqi > 100
                                      ? 'text-[#FF5C4D]'
                                      : city.aqi > 50
                                      ? 'text-[#F6B73C]'
                                      : 'text-[#63D9B3]'
                                  }
                                >
                                  AQI {city.aqi}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Calibration Wizard Link */}
                  {onOpenLocationOnboarding && (
                    <div
                      className={`pt-2 mt-2 border-t flex justify-end ${
                        isLight ? 'border-black/10' : 'border-white/10'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setCityMenuOpen(false);
                          onOpenLocationOnboarding();
                        }}
                        className="text-[11px] font-mono text-[#8EDCFF] hover:underline cursor-pointer"
                      >
                        ⚙ Calibrate Location & Sensors
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Temperature Unit Toggle (°C / °F) */}
          <button
            id="nav-temp-unit-toggle"
            onClick={onToggleTempUnit}
            title="Toggle Celsius / Fahrenheit"
            className={`px-2 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer border ${
              isLight
                ? 'bg-black/[0.03] hover:bg-black/[0.06] border-black/[0.08] text-[#D98C12]'
                : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] text-[#F6B73C]'
            }`}
          >
            {isCelsius ? '°C' : '°F'}
          </button>

          {/* User Bio Profile Indicator */}
          <button
            id="nav-profile-pill-btn"
            onClick={() => onNavigate('profile')}
            title="Biological Profile & Sensitivity Calibration"
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer border ${
              isLight
                ? 'bg-black/[0.03] hover:bg-black/[0.06] border-black/[0.08] text-[#1C1A24]'
                : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] text-[#F4F1EA]'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#FF5C4D]/15 border border-[#FF5C4D]/35 flex items-center justify-center shrink-0">
              <Sliders className="w-2.5 h-2.5 text-[#FF5C4D]" />
            </div>
            <span className="capitalize text-xs font-medium truncate max-w-[65px] sm:max-w-[85px] hidden xs:inline">
              {userProfile.healthCondition === 'heart_condition'
                ? 'Cardiac'
                : userProfile.healthCondition}
            </span>
          </button>

          {/* NEW Light / Dark Mode Toggle Button */}
          <button
            id="nav-theme-toggle"
            onClick={onToggleTheme}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
            className={`relative flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl transition-all duration-300 cursor-pointer border ${
              isLight
                ? 'bg-[#EAE7DF] hover:bg-[#E0DDD5] border-black/10 text-[#D98C12] shadow-sm'
                : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-[#8EDCFF] hover:text-white'
            }`}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -60, scale: 0.7, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 60, scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex items-center justify-center"
            >
              {isLight ? (
                <Sun className="w-4 h-4 text-[#D98C12] drop-shadow-[0_0_6px_rgba(217,140,18,0.4)]" />
              ) : (
                <Moon className="w-4 h-4 text-[#8EDCFF] drop-shadow-[0_0_6px_rgba(142,220,255,0.45)]" />
              )}
            </motion.div>
          </button>

          {/* Replay Opening Intro Button */}
          {onReplayIntro && (
            <button
              id="nav-replay-intro-btn"
              onClick={onReplayIntro}
              title="Replay Cinematic Opening Sequence"
              className={`hidden md:flex items-center justify-center w-8 h-8 rounded-xl transition-all cursor-pointer border ${
                isLight
                  ? 'bg-black/[0.03] hover:bg-black/[0.06] border-black/[0.08] text-[#7E798A] hover:text-[#1C1A24]'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] text-[#8A8579] hover:text-[#F4F1EA]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

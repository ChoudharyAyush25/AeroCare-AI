import React, { useState, useEffect, useRef } from 'react';
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
  Radio
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
  telemetryStatusMessage
}) => {
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: 'hero', label: 'Intro' },
    { id: 'environment', label: 'Atmosphere', icon: Wind },
    { id: 'profile', label: 'Bio Profile', icon: Sliders },
    { id: 'analysis', label: 'AI Synthesis', icon: Activity },
    { id: 'risk', label: 'Health Risk', icon: ShieldAlert },
    { id: 'plan', label: 'Daily Plan', icon: Calendar },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Brand */}
        <button
          id="nav-brand-btn"
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-3 group focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#72d6a0] to-[#8fc9d6] flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
            <div className="w-4 h-4 bg-white/20 rounded-full blur-[1px]" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                AeroCare <span className="text-emerald-500">AI</span>
              </span>
              {currentCity.isRealTelemetry ? (
                <span className="text-[9px] uppercase font-semibold tracking-wider text-emerald-400/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live Telemetry
                </span>
              ) : (
                <span className="text-[9px] uppercase font-semibold tracking-wider text-zinc-500">
                  Preset
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono tracking-tighter text-zinc-500 hidden sm:block">
              {currentCity.isRealTelemetry ? currentCity.lastUpdated : 'SYSTEM: ACTIVE'}
            </p>
          </div>
        </button>

        {/* Center Desktop Navigation Pill */}
        <nav
          id="main-nav-pill"
          className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full bg-[#071413]/60 backdrop-blur-xl border border-white/[0.06]"
        >
          {navItems.map((item, idx) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-emerald-300 bg-white/5 border-b border-emerald-400/70'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                0{idx + 1} {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: City Selector + Temp Toggle + Profile Pill */}
        <div className="flex items-center gap-2">
          {/* City Selector dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="nav-city-select-btn"
              onClick={() => setCityMenuOpen(!cityMenuOpen)}
              className="flex items-center gap-2 bg-[#071413]/60 hover:bg-white/5 px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/20 text-xs text-zinc-300 transition-all cursor-pointer"
              title="Select or search location"
            >
              {isLoadingTelemetry ? (
                <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="max-w-[110px] truncate font-medium">{currentCity.location.split(',')[0]}</span>
              <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${cityMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {cityMenuOpen && (
              <div
                id="nav-city-dropdown"
                className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl glass-panel-glow bg-zinc-950/95 border border-zinc-800 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Geolocation Trigger */}
                <button
                  id="nav-use-my-location-btn"
                  onClick={handleMyLocationClick}
                  disabled={isLoadingTelemetry}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium transition-colors cursor-pointer group mb-2.5"
                >
                  <div className="flex items-center gap-2">
                    {isLoadingTelemetry ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    ) : (
                      <Compass className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-45 transition-transform" />
                    )}
                    <span>Use My Current Location</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400/90 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                    GPS
                  </span>
                </button>

                {/* Search Bar */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search global city or region..."
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
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
                  <div className="mb-2.5 pb-2.5 border-b border-zinc-800/80">
                    <div className="px-1 py-1 text-[10px] uppercase font-bold tracking-widest text-zinc-500 flex items-center justify-between">
                      <span>Global Search Results</span>
                      {isSearching && <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />}
                    </div>

                    {isSearching && searchResults.length === 0 && (
                      <div className="py-3 text-center text-xs text-zinc-500">
                        Querying atmospheric telemetry...
                      </div>
                    )}

                    {!isSearching && searchResults.length === 0 && (
                      <div className="py-2.5 text-center text-xs text-zinc-500">
                        No locations found for &ldquo;{searchQuery}&rdquo;
                      </div>
                    )}

                    <div className="py-0.5 max-h-44 overflow-y-auto space-y-1">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.id}-${result.latitude}-${result.longitude}`}
                          onClick={() => handleSelectSearchResult(result)}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between text-zinc-300 hover:bg-zinc-800/70 hover:text-emerald-300 transition-colors cursor-pointer group"
                        >
                          <div className="truncate pr-2">
                            <p className="font-medium text-zinc-200 group-hover:text-emerald-300 truncate">
                              {result.name}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate">
                              {[result.admin1, result.country].filter(Boolean).join(', ')}
                            </p>
                          </div>
                          <Radio className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preset Stations */}
                <div>
                  <div className="px-1 py-1 text-[10px] uppercase font-bold tracking-widest text-zinc-500 flex items-center justify-between">
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
                              ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                              : 'text-zinc-300 hover:bg-zinc-800/60'
                          }`}
                        >
                          <div>
                            <p className="font-medium">{c.location}</p>
                            <p className="text-[10px] text-zinc-500">{c.country}</p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                c.aqi <= 50
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : c.aqi <= 100
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-rose-500/20 text-rose-300'
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
              </div>
            )}
          </div>

          {/* Unit Switcher °C / °F */}
          <button
            id="nav-temp-unit-toggle"
            onClick={onToggleTempUnit}
            title="Toggle Celsius / Fahrenheit"
            className="glass-panel bg-zinc-900/60 px-2.5 py-1.5 rounded-xl border border-zinc-800 text-xs font-mono font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
          >
            {isCelsius ? '°C' : '°F'}
          </button>

          {/* Quick Profile Status pill */}
          <button
            id="nav-profile-pill-btn"
            onClick={() => onNavigate('profile')}
            className="hidden lg:flex items-center gap-1.5 glass-panel bg-zinc-900/60 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs text-zinc-300 hover:border-emerald-500/40 transition-all cursor-pointer"
            title="Current Bio-Profile"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="capitalize font-medium text-zinc-200">
              {userProfile.healthCondition === 'heart_condition' ? 'Cardiac' : userProfile.healthCondition}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 capitalize">{userProfile.ageGroup}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

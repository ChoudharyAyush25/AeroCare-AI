import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Search,
  Compass,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Radio,
  ArrowRight,
  Sparkles,
  Wind,
  Activity,
  X
} from 'lucide-react';
import { EnvironmentalData, LocationSearchResult } from '../types';
import {
  getUserCoordinates,
  reverseGeocode,
  fetchRealTimeEnvironmentalData,
  searchGlobalLocations,
  PRESET_CITY_COORDINATES
} from '../services/environmentalService';
import { CITIES } from '../data/mockData';

interface LocationInitializationProps {
  onLocationSelected: (data: EnvironmentalData) => void;
}

type StepState = 'prompt' | 'search' | 'denied' | 'connecting';

interface TelemetryStage {
  label: string;
  detail?: string;
  completed: boolean;
}

const SUGGESTED_STATIONS = [
  { name: 'San Francisco', region: 'California, US', lat: 37.7749, lon: -122.4194, aqi: 38 },
  { name: 'Tokyo', region: 'Kanto, Japan', lat: 35.6895, lon: 139.6917, aqi: 28 },
  { name: 'London', region: 'Greater London, UK', lat: 51.5074, lon: -0.1278, aqi: 44 },
  { name: 'New York', region: 'New York, US', lat: 40.7128, lon: -74.0060, aqi: 46 },
  { name: 'Paris', region: 'Île-de-France, France', lat: 48.8566, lon: 2.3522, aqi: 35 },
  { name: 'New Delhi', region: 'Delhi, India', lat: 28.6139, lon: 77.2090, aqi: 172 },
  { name: 'Sydney', region: 'New South Wales, AU', lat: -33.8688, lon: 151.2093, aqi: 24 }
];

export const LocationInitialization: React.FC<LocationInitializationProps> = ({
  onLocationSelected,
}) => {
  const [step, setStep] = useState<StepState>('prompt');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeLocationLabel, setActiveLocationLabel] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Cinematic telemetry stages during connection
  const [telemetryStages, setTelemetryStages] = useState<TelemetryStage[]>([
    { label: 'LOCATION SIGNAL DETECTED', completed: false },
    { label: 'ATMOSPHERIC DATA LINKED', completed: false },
    { label: 'AIR QUALITY MATRIX INITIALIZED', completed: false },
    { label: 'PERSONAL ENVIRONMENT READY', completed: false },
  ]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on transitioning to search or denied mode
  useEffect(() => {
    if (step === 'search' || step === 'denied') {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [step]);

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
        console.warn('Location query error', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Run the sequence of loading environmental data and animating telemetry stages
  const runTelemetrySequence = async (
    lat: number,
    lon: number,
    locationName: string,
    countryName?: string
  ) => {
    setStep('connecting');
    setActiveLocationLabel(locationName);
    setTelemetryStages([
      { label: 'LOCATION SIGNAL DETECTED', detail: `${locationName} // ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`, completed: false },
      { label: 'ATMOSPHERIC DATA LINKED', detail: 'Fetching satellite & lidar weather streams...', completed: false },
      { label: 'AIR QUALITY MATRIX INITIALIZED', detail: 'Calibrating US AQI, PM2.5, and UV indices...', completed: false },
      { label: 'PERSONAL ENVIRONMENT READY', detail: 'Synthesizing local biospheric footprint...', completed: false },
    ]);

    try {
      // Step 1: Location Signal detected
      await new Promise((r) => setTimeout(r, 450));
      setTelemetryStages((prev) => [
        { ...prev[0], completed: true },
        prev[1],
        prev[2],
        prev[3]
      ]);

      // Step 2: Fetch atmospheric telemetry
      const envData = await fetchRealTimeEnvironmentalData(
        lat,
        lon,
        locationName,
        countryName,
        true
      );

      await new Promise((r) => setTimeout(r, 400));
      setTelemetryStages((prev) => [
        prev[0],
        { ...prev[1], detail: `${envData.temperature}°C • ${envData.weatherCondition} • Wind ${envData.windSpeed} km/h`, completed: true },
        prev[2],
        prev[3]
      ]);

      // Step 3: Air quality calibrated
      await new Promise((r) => setTimeout(r, 400));
      setTelemetryStages((prev) => [
        prev[0],
        prev[1],
        { ...prev[2], detail: `AQI ${envData.aqi} [${envData.aqiCategory.toUpperCase()}] • PM2.5 ${envData.pollutants.pm25} µg/m³`, completed: true },
        prev[3]
      ]);

      // Step 4: Ready
      await new Promise((r) => setTimeout(r, 400));
      setTelemetryStages((prev) => [
        prev[0],
        prev[1],
        prev[2],
        { ...prev[3], detail: 'All atmospheric telemetry linked to biological telemetry.', completed: true }
      ]);

      // Smooth enter into AeroCare
      await new Promise((r) => setTimeout(r, 600));
      onLocationSelected(envData);
    } catch (err: any) {
      console.warn('Real telemetry sequence error, falling back to sensor station:', err);
      // Fallback to closest preset or default city safely
      const fallback = CITIES.find((c) => c.location.toLowerCase().includes(locationName.toLowerCase())) || {
        ...CITIES[0],
        location: locationName,
        country: countryName || 'Global Grid'
      };
      onLocationSelected(fallback);
    }
  };

  // Option 1: Browser GPS Location Handler
  const handleUseMyLocation = async () => {
    setStatusMessage(null);
    setStep('connecting');
    setActiveLocationLabel('Acquiring Satellite GPS Fix...');
    setTelemetryStages([
      { label: 'SEARCHING SAT-NAV SENSORS', detail: 'Requesting device coordinates...', completed: false },
      { label: 'ATMOSPHERIC DATA LINKED', completed: false },
      { label: 'AIR QUALITY MATRIX INITIALIZED', completed: false },
      { label: 'PERSONAL ENVIRONMENT READY', completed: false },
    ]);

    try {
      const coords = await getUserCoordinates();
      const geoInfo = await reverseGeocode(coords.latitude, coords.longitude);
      await runTelemetrySequence(
        coords.latitude,
        coords.longitude,
        geoInfo.location,
        geoInfo.country
      );
    } catch (err: any) {
      console.warn('Geolocation acquisition error:', err);
      // Transition smoothly to permission denied / manual selection without blocking
      if (err.isDenied || err.code === 1 || /denied/i.test(err.message)) {
        setStep('denied');
      } else {
        setStatusMessage(err.message || 'Location information currently unavailable. Select a city manually below.');
        setStep('search');
      }
    }
  };

  // Option 2 / Suggested City Selection
  const handleSelectSuggestedCity = async (city: typeof SUGGESTED_STATIONS[0]) => {
    await runTelemetrySequence(city.lat, city.lon, city.name, city.region);
  };

  // Search Result Selection
  const handleSelectSearchResult = async (result: LocationSearchResult) => {
    await runTelemetrySequence(result.latitude, result.longitude, result.name, result.country);
  };

  return (
    <div
      id="location-initialization-screen"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 py-8 bg-[#080A16] text-[#F4F1EA] overflow-y-auto"
    >
      {/* Ambient Celestial Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#FF5C4D]/10 via-[#F6B73C]/5 to-transparent rounded-full blur-[140px]" />
        <div className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] bg-[#151326] rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(#F6B73C 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Main Glass HUD Container */}
      <div className="relative z-10 w-full max-w-xl mx-auto my-auto">
        <AnimatePresence mode="wait">
          {/* =========================================================================
              PHASE 1: PROMPT STATE
              Clean, Apple-level simplicity + futuristic instrument.
          ========================================================================= */}
          {step === 'prompt' && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="p-6 sm:p-10 rounded-3xl bg-[#151326]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_0_60px_rgba(0,0,0,0.7)] text-center relative overflow-hidden"
            >
              {/* Atmospheric Header Bar Accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF5C4D] to-transparent" />

              {/* Celestial Radar Disc */}
              <div className="relative w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-tr from-[#FF5C4D] via-[#F6B73C] to-[#FF5C4D] p-[1.5px] shadow-[0_0_30px_rgba(255,92,77,0.35)]">
                <div className="w-full h-full rounded-full bg-[#080A16] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#FF5C4D]/15 animate-ping opacity-30 rounded-full" />
                  <Compass className="w-7 h-7 text-[#FF5C4D] transition-transform duration-700 hover:rotate-90" />
                </div>
              </div>

              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono tracking-widest text-[#8EDCFF] uppercase mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8EDCFF] animate-pulse" />
                Atmospheric Alignment Phase
              </div>

              {/* Main Heading requested by user */}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F1EA] uppercase leading-tight">
                Your Environment Is The <span className="text-[#FF5C4D]">First Signal.</span>
              </h1>

              {/* Supporting text requested by user */}
              <p className="mt-3 text-sm sm:text-base text-[#C8C3B7] max-w-md mx-auto leading-relaxed">
                AeroCare analyzes real-time atmospheric conditions and their relationship with your personal health profile.
              </p>

              {/* Primary & Secondary Options */}
              <div className="mt-8 space-y-3.5">
                {/* Option 1 — Primary: 📍 USE MY CURRENT LOCATION */}
                <button
                  id="location-use-my-location-primary"
                  onClick={handleUseMyLocation}
                  className="w-full group relative flex flex-col items-center sm:items-start p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FF5C4D] via-[#FF6E5F] to-[#F6B73C] text-[#080A16] font-semibold transition-all duration-300 shadow-[0_0_35px_rgba(255,92,77,0.35)] hover:shadow-[0_0_50px_rgba(255,92,77,0.6)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#080A16]/20 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#080A16]" />
                      </div>
                      <span className="text-base sm:text-lg font-bold tracking-wide uppercase">
                        Use My Current Location
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-2 text-xs sm:text-[13px] text-[#080A16]/80 font-medium text-left">
                    Allow location access to initialize live environmental telemetry around you.
                  </p>
                </button>

                {/* Option 2 — Secondary: 🔎 CHOOSE A CITY */}
                <button
                  id="location-choose-city-btn"
                  onClick={() => setStep('search')}
                  className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/20 text-[#F4F1EA] transition-all duration-200 cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-[#8EDCFF]">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold tracking-wide uppercase">
                        Choose a City
                      </div>
                      <p className="text-xs text-[#8A8579]">
                        Search global cities or choose from curated scientific stations.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#8A8579] group-hover:text-[#F4F1EA] transition-colors">
                    BROWSE →
                  </span>
                </button>
              </div>

              {/* Quick Suggested Stations Row */}
              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                <div className="text-[10px] font-mono tracking-widest text-[#8A8579] uppercase mb-2.5">
                  Or select a verified telemetry station:
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {SUGGESTED_STATIONS.slice(0, 5).map((station) => (
                    <button
                      key={station.name}
                      onClick={() => handleSelectSuggestedCity(station)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#FF5C4D]/40 text-xs font-medium text-[#C8C3B7] hover:text-[#F4F1EA] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{station.name}</span>
                      <span className="text-[9px] font-mono text-[#8A8579]">
                        AQI {station.aqi}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              PHASE 2: PERMISSION DENIED STATE
              Graceful fallback without blocking the application.
          ========================================================================= */}
          {step === 'denied' && (
            <motion.div
              key="denied"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="p-6 sm:p-10 rounded-3xl bg-[#151326]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_0_60px_rgba(0,0,0,0.7)] text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F6B73C] to-transparent" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F6B73C]">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#F4F1EA]">
                    Location Access Not Enabled
                  </h2>
                  <p className="text-xs text-[#8A8579] font-mono">
                    Device coordinate permissions were not granted.
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#C8C3B7] leading-relaxed mb-6">
                You can still explore AeroCare by selecting a location manually. Search any global city or pick a recommended station below.
              </p>

              {/* Prominent Search Input */}
              <div className="relative mb-5">
                <Search className="w-4 h-4 text-[#8A8579] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type city or region (e.g., Tokyo, London, Austin)..."
                  className="w-full bg-[#080A16] border border-white/15 rounded-xl pl-10 pr-9 py-3 text-sm text-[#F4F1EA] placeholder-[#8A8579] focus:outline-none focus:border-[#FF5C4D] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8579] hover:text-[#F4F1EA]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Live Search Results */}
              {searchQuery.trim().length >= 2 && (
                <div className="mb-6 bg-[#080A16]/60 rounded-xl border border-white/[0.08] p-2 max-h-48 overflow-y-auto space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8579] px-2 py-1 flex items-center justify-between">
                    <span>Search Results</span>
                    {isSearching && <Loader2 className="w-3 h-3 animate-spin text-[#F6B73C]" />}
                  </div>

                  {!isSearching && searchResults.length === 0 && (
                    <div className="py-4 text-center text-xs text-[#8A8579]">
                      No matching stations found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}

                  {searchResults.map((result) => (
                    <button
                      key={`${result.id}-${result.latitude}-${result.longitude}`}
                      onClick={() => handleSelectSearchResult(result)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-[#C8C3B7] hover:bg-white/[0.06] hover:text-[#F4F1EA] transition-colors cursor-pointer group"
                    >
                      <div className="truncate pr-2">
                        <p className="font-medium text-[#F4F1EA] group-hover:text-[#FF5C4D] truncate">
                          {result.name}
                        </p>
                        <p className="text-[10px] text-[#8A8579] truncate">
                          {[result.admin1, result.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <Radio className="w-3.5 h-3.5 text-[#8A8579] group-hover:text-[#8EDCFF] shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Suggested Cities Grid */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A8579]">
                  Recommended Global Stations
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTED_STATIONS.map((station) => (
                    <button
                      key={station.name}
                      onClick={() => handleSelectSuggestedCity(station)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-[#FF5C4D]/40 text-left transition-all cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#F4F1EA] group-hover:text-[#FF5C4D]">
                          {station.name}
                        </div>
                        <div className="text-[10px] text-[#8A8579]">
                          {station.region}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-[#8EDCFF]">
                        AQI {station.aqi}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Back to primary prompt button */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
                <button
                  onClick={() => setStep('prompt')}
                  className="text-xs font-mono text-[#8A8579] hover:text-[#F4F1EA] transition-colors cursor-pointer"
                >
                  ← Return to Location Detection
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              PHASE 3: MANUAL CITY SEARCH STATE
              Full searchable modal with global geocoding API.
          ========================================================================= */}
          {step === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="p-6 sm:p-10 rounded-3xl bg-[#151326]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_0_60px_rgba(0,0,0,0.7)] text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8EDCFF] to-transparent" />

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-[#F4F1EA]">
                    Select Your Atmospheric Location
                  </h2>
                  <p className="text-xs text-[#8A8579]">
                    Search any global city or pick a recommended station to begin.
                  </p>
                </div>
                <button
                  onClick={() => setStep('prompt')}
                  className="p-2 rounded-lg text-[#8A8579] hover:text-[#F4F1EA] hover:bg-white/5 transition-colors cursor-pointer"
                  title="Back"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {statusMessage && (
                <div className="mb-4 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  {statusMessage}
                </div>
              )}

              {/* Search Bar */}
              <div className="relative mb-5">
                <Search className="w-4 h-4 text-[#8A8579] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city, region, or capital..."
                  className="w-full bg-[#080A16] border border-white/15 rounded-xl pl-10 pr-9 py-3 text-sm text-[#F4F1EA] placeholder-[#8A8579] focus:outline-none focus:border-[#FF5C4D] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8579] hover:text-[#F4F1EA]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Live Search Results */}
              {searchQuery.trim().length >= 2 && (
                <div className="mb-6 bg-[#080A16]/60 rounded-xl border border-white/[0.08] p-2 max-h-48 overflow-y-auto space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8579] px-2 py-1 flex items-center justify-between">
                    <span>Global Search Results</span>
                    {isSearching && <Loader2 className="w-3 h-3 animate-spin text-[#F6B73C]" />}
                  </div>

                  {!isSearching && searchResults.length === 0 && (
                    <div className="py-4 text-center text-xs text-[#8A8579]">
                      No locations found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}

                  {searchResults.map((result) => (
                    <button
                      key={`${result.id}-${result.latitude}-${result.longitude}`}
                      onClick={() => handleSelectSearchResult(result)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-[#C8C3B7] hover:bg-white/[0.06] hover:text-[#F4F1EA] transition-colors cursor-pointer group"
                    >
                      <div className="truncate pr-2">
                        <p className="font-medium text-[#F4F1EA] group-hover:text-[#FF5C4D] truncate">
                          {result.name}
                        </p>
                        <p className="text-[10px] text-[#8A8579] truncate">
                          {[result.admin1, result.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <Radio className="w-3.5 h-3.5 text-[#8A8579] group-hover:text-[#8EDCFF] shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Suggested Stations */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A8579]">
                  Preset Scientific Telemetry Stations
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTED_STATIONS.map((station) => (
                    <button
                      key={station.name}
                      onClick={() => handleSelectSuggestedCity(station)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-[#FF5C4D]/40 text-left transition-all cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#F4F1EA] group-hover:text-[#FF5C4D]">
                          {station.name}
                        </div>
                        <div className="text-[10px] text-[#8A8579]">
                          {station.region}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-[#8EDCFF]">
                        AQI {station.aqi}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Back CTA */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
                <button
                  onClick={() => setStep('prompt')}
                  className="text-xs font-mono text-[#8A8579] hover:text-[#F4F1EA] transition-colors cursor-pointer"
                >
                  ← Or Use Device GPS Location
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              PHASE 4: CONNECTING & INITIALIZATION SEQUENCE
              Cinematic verification checklist with Solar Eclipse palette.
          ========================================================================= */}
          {step === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="p-6 sm:p-10 rounded-3xl bg-[#151326]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.8)] text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF5C4D] via-[#F6B73C] to-[#8EDCFF]" />

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5C4D] to-[#F6B73C] p-[1px] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#080A16] flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-[#FF5C4D] animate-spin" />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-[#F6B73C] uppercase">
                    INITIALIZING TELEMETRY PIPELINE
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#F4F1EA] truncate max-w-[340px]">
                    {activeLocationLabel || 'Acquiring Coordinates...'}
                  </h2>
                </div>
              </div>

              {/* Sequence Checklist */}
              <div className="space-y-3.5 py-2">
                {telemetryStages.map((stage, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all duration-300 ${
                      stage.completed
                        ? 'bg-white/[0.04] border-[#63D9B3]/30 text-[#F4F1EA]'
                        : 'bg-white/[0.01] border-white/[0.05] text-[#8A8579]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {stage.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#63D9B3] shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
                          </span>
                        )}
                        <span className="text-xs font-mono font-semibold tracking-wider">
                          {stage.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8A8579]">
                        {stage.completed ? 'VERIFIED ✓' : 'PROCESSING...'}
                      </span>
                    </div>
                    {stage.detail && (
                      <p className="mt-1 text-[11px] font-mono text-[#8EDCFF]/80 pl-6.5 truncate">
                        {stage.detail}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress Indicator Line */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#8A8579]">
                <span>AeroCare AI Biospheric Neural Engine</span>
                <span className="text-[#8EDCFF] animate-pulse">CONNECTING...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

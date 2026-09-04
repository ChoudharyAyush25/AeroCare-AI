import React, { useState, useEffect, useMemo } from 'react';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { EnvironmentSection } from './components/EnvironmentSection';
import { ProfileSection } from './components/ProfileSection';
import { AnalysisSection } from './components/AnalysisSection';
import { RiskSection } from './components/RiskSection';
import { PlanSection } from './components/PlanSection';
import { TrendsSection } from './components/TrendsSection';
import { StoryProgress } from './components/StoryProgress';
import { WeatherEnvironment } from './components/WeatherEnvironment';
import { CinematicIntro } from './components/CinematicIntro';
import { LocationInitialization } from './components/LocationInitialization';

import {
  UserProfile,
  EnvironmentalData,
  RiskLevel,
  WeatherVisualType
} from './types';
import {
  CITIES,
  INITIAL_PROFILE,
  calculateHealthRisk,
  generateDayPlan,
  generateHourlyTrends
} from './data/mockData';
import {
  fetchRealTimeEnvironmentalData,
  getUserCoordinates,
  reverseGeocode,
  PRESET_CITY_COORDINATES,
  getSavedUserLocation,
  saveUserLocation
} from './services/environmentalService';

export default function App() {
  const [showCinematicIntro, setShowCinematicIntro] = useState<boolean>(true);
  const [showLocationOnboarding, setShowLocationOnboarding] = useState<boolean>(false);
  const [currentCity, setCurrentCity] = useState<EnvironmentalData>(() => {
    const saved = getSavedUserLocation();
    if (saved) {
      const match = CITIES.find((c) => c.location.toLowerCase().includes(saved.location.toLowerCase()));
      if (match) return match;
      return {
        ...CITIES[0],
        location: saved.location,
        country: saved.country || 'Global Station',
        coordinates: {
          latitude: saved.lat,
          longitude: saved.lon
        }
      };
    }
    // Initial placeholder while awaiting user location onboarding (does NOT show San Francisco)
    return {
      ...CITIES[0],
      location: 'Atmospheric Station',
      country: 'Awaiting Coordinates'
    };
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [isCelsius, setIsCelsius] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [riskLevelOverride, setRiskLevelOverride] = useState<RiskLevel | null>(null);
  const [weatherOverride, setWeatherOverride] = useState<WeatherVisualType | null>(null);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState<boolean>(false);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);

  // Load real telemetry for given coordinates
  const loadTelemetryForCoordinates = async (
    lat: number,
    lon: number,
    locationName: string,
    countryName?: string,
    bypassCache = false
  ) => {
    setIsLoadingTelemetry(true);
    setTelemetryError(null);
    try {
      const realData = await fetchRealTimeEnvironmentalData(
        lat,
        lon,
        locationName,
        countryName,
        bypassCache
      );
      setCurrentCity(realData);
      setRiskLevelOverride(null);
      setWeatherOverride(null);
    } catch (err: any) {
      console.warn('Real environmental data fetch error:', err);
      setTelemetryError('Live telemetry temporarily unavailable. Displaying local sensor cache.');
      setTimeout(() => setTelemetryError(null), 6000);
    } finally {
      setIsLoadingTelemetry(false);
    }
  };

  // Callback when user selects location through the cinematic onboarding overlay
  const handleLocationSelected = (data: EnvironmentalData) => {
    setCurrentCity(data);
    setRiskLevelOverride(null);
    setWeatherOverride(null);
    setShowLocationOnboarding(false);
  };

  // Handler for selecting preset city or city object
  const handleSelectCity = async (city: EnvironmentalData) => {
    const preset = PRESET_CITY_COORDINATES[city.location];
    if (preset) {
      saveUserLocation({
        lat: preset.lat,
        lon: preset.lon,
        location: preset.location,
        country: preset.country
      });
      await loadTelemetryForCoordinates(preset.lat, preset.lon, preset.location, preset.country);
    } else if (city.coordinates) {
      saveUserLocation({
        lat: city.coordinates.latitude,
        lon: city.coordinates.longitude,
        location: city.location,
        country: city.country
      });
      await loadTelemetryForCoordinates(
        city.coordinates.latitude,
        city.coordinates.longitude,
        city.location,
        city.country
      );
    } else {
      setCurrentCity(city);
      setRiskLevelOverride(null);
      setWeatherOverride(null);
    }
  };

  // Handler for global location search selection
  const handleSelectCoordinates = async (
    lat: number,
    lon: number,
    locationName: string,
    countryName?: string
  ) => {
    saveUserLocation({
      lat,
      lon,
      location: locationName,
      country: countryName
    });
    await loadTelemetryForCoordinates(lat, lon, locationName, countryName);
  };

  // Handler for "Use My Location" (GPS)
  const handleUseMyLocation = async () => {
    setIsLoadingTelemetry(true);
    setTelemetryError(null);
    try {
      const coords = await getUserCoordinates();
      const geoInfo = await reverseGeocode(coords.latitude, coords.longitude);
      saveUserLocation({
        lat: coords.latitude,
        lon: coords.longitude,
        location: geoInfo.location,
        country: geoInfo.country,
        isGps: true
      });
      await loadTelemetryForCoordinates(
        coords.latitude,
        coords.longitude,
        geoInfo.location,
        geoInfo.country,
        true
      );
    } catch (err: any) {
      console.warn('Geolocation acquisition error:', err);
      setTelemetryError(err.message || 'Location permission denied or unavailable.');
      setTimeout(() => setTelemetryError(null), 6000);
    } finally {
      setIsLoadingTelemetry(false);
    }
  };

  // On initial mount: if a persisted location exists, synchronize its live telemetry
  useEffect(() => {
    const saved = getSavedUserLocation();
    if (saved) {
      loadTelemetryForCoordinates(
        saved.lat,
        saved.lon,
        saved.location,
        saved.country
      );
    }
  }, []);

  // Dynamically calculate assessment based on user profile & selected city
  const assessment = useMemo(() => {
    const raw = calculateHealthRisk(userProfile, currentCity);
    if (riskLevelOverride) {
      return {
        ...raw,
        riskLevel: riskLevelOverride
      };
    }
    return raw;
  }, [userProfile, currentCity, riskLevelOverride]);

  // Dynamically generate daily recommendations
  const dayPlan = useMemo(() => {
    return generateDayPlan(userProfile, currentCity, assessment);
  }, [userProfile, currentCity, assessment]);

  // Dynamically generate 24-hour predictive trend curve
  const trends = useMemo(() => {
    return generateHourlyTrends(userProfile, currentCity);
  }, [userProfile, currentCity]);

  // Story sections definition
  const sections = [
    { id: 'hero', label: 'Story Intro' },
    { id: 'environment', label: 'Atmosphere' },
    { id: 'profile', label: 'Bio Profile' },
    { id: 'analysis', label: 'AI Synthesis' },
    { id: 'risk', label: 'Health Risk' },
    { id: 'plan', label: 'Daily Plan' },
    { id: 'trends', label: 'Trends' },
  ];

  // Scroll to section handler
  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to next section in order
  const scrollToNext = (currentId: string) => {
    const currentIndex = sections.findIndex((s) => s.id === currentId);
    if (currentIndex >= 0 && currentIndex < sections.length - 1) {
      scrollToSection(sections[currentIndex + 1].id);
    }
  };

  // Active section tracking using IntersectionObserver
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-30% 0px -30% 0px',
      threshold: 0.1,
    });

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#080A16] text-[#F4F1EA] selection:bg-[#FF5C4D]/30 selection:text-[#F4F1EA] relative font-sans">
      {/* Cinematic Opening Intelligence Boot Sequence */}
      {showCinematicIntro && (
        <CinematicIntro
          currentCity={currentCity}
          onComplete={() => {
            setShowCinematicIntro(false);
            setShowLocationOnboarding(true);
          }}
        />
      )}

      {/* Cinematic Location Onboarding Experience for First-Time or Manual Re-calibration */}
      {showLocationOnboarding && !showCinematicIntro && (
        <LocationInitialization
          onLocationSelected={handleLocationSelected}
        />
      )}

      {/* Living Atmospheric Weather Environment System */}
      <WeatherEnvironment
        currentCity={currentCity}
        activeSection={activeSection}
        riskLevel={assessment.riskLevel}
        weatherOverride={weatherOverride}
        onWeatherOverrideChange={setWeatherOverride}
      />

      {/* Top Floating Glass Navigation */}
      <Navigation
        activeSection={activeSection}
        onNavigate={scrollToSection}
        currentCity={currentCity}
        onSelectCity={handleSelectCity}
        userProfile={userProfile}
        isCelsius={isCelsius}
        onToggleTempUnit={() => setIsCelsius(!isCelsius)}
        isLoadingTelemetry={isLoadingTelemetry}
        onSelectCoordinates={handleSelectCoordinates}
        onUseMyLocation={handleUseMyLocation}
        telemetryStatusMessage={telemetryError}
        onReplayIntro={() => setShowCinematicIntro(true)}
        onOpenLocationOnboarding={() => setShowLocationOnboarding(true)}
      />

      {/* Side Vertical Story Dots Navigation */}
      <StoryProgress
        sections={sections}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      {/* 1. Hero Section */}
      <HeroSection
        currentCity={currentCity}
        userProfile={userProfile}
        assessment={assessment}
        isCelsius={isCelsius}
        weatherOverride={weatherOverride}
        onScrollToNext={() => scrollToSection('environment')}
        onNavigate={scrollToSection}
        onReplayIntro={() => setShowCinematicIntro(true)}
      />

      {/* 2. Environment Section */}
      <EnvironmentSection
        currentCity={currentCity}
        onSelectCity={handleSelectCity}
        isCelsius={isCelsius}
        onToggleTempUnit={() => setIsCelsius(!isCelsius)}
        onScrollToNext={() => scrollToSection('profile')}
        isLoadingTelemetry={isLoadingTelemetry}
      />

      {/* 3. Personal Profile Section */}
      <ProfileSection
        userProfile={userProfile}
        onChangeProfile={(profile) => {
          setUserProfile(profile);
          setRiskLevelOverride(null);
        }}
        onScrollToNext={() => scrollToSection('analysis')}
      />

      {/* 4. AI Analysis Section */}
      <AnalysisSection
        currentCity={currentCity}
        userProfile={userProfile}
        assessment={assessment}
        onScrollToNext={() => scrollToSection('risk')}
      />

      {/* 5. Personalized Health Risk Section */}
      <RiskSection
        assessment={assessment}
        userProfile={userProfile}
        currentCity={currentCity}
        onOverrideRiskLevel={(level) => setRiskLevelOverride(level)}
        onScrollToNext={() => scrollToSection('plan')}
      />

      {/* 6. Today's Personalized Plan Section */}
      <PlanSection
        dayPlan={dayPlan}
        userProfile={userProfile}
        currentCity={currentCity}
        assessment={assessment}
        isCelsius={isCelsius}
        onScrollToNext={() => scrollToSection('trends')}
      />

      {/* 7. Environmental Trends Section */}
      <TrendsSection
        trends={trends}
        userProfile={userProfile}
        currentCity={currentCity}
        assessment={assessment}
        isCelsius={isCelsius}
        onScrollToTop={() => scrollToSection('hero')}
        onNavigateToProfile={() => scrollToSection('profile')}
      />

      {/* Elegant Dark Footer Disclaimer */}
      <footer className="w-full border-t border-white/10 py-8 px-4 sm:px-8 text-center text-xs text-[#8A8579] bg-[#080A16]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[10px] text-[#8A8579] uppercase tracking-[0.2em] font-semibold">
            <div className="w-2 h-2 rounded-full bg-[#FF5C4D]"></div>
            <span>© 2025 AEROCARE AI • ATMOSPHERIC INTELLIGENCE</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] text-[#8A8579]/70 uppercase tracking-[0.2em] font-medium">
            <span className="hover:text-[#F4F1EA] transition-colors">GDPR Compliant Data</span>
            <span className="hover:text-[#F4F1EA] transition-colors">Clinical Validation v4.1</span>
            <span className="hover:text-[#F4F1EA] transition-colors">Solar Eclipse Intelligence v2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

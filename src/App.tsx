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
  PRESET_CITY_COORDINATES
} from './services/environmentalService';

export default function App() {
  const [currentCity, setCurrentCity] = useState<EnvironmentalData>(CITIES[0]);
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

  // Handler for selecting preset city or city object
  const handleSelectCity = async (city: EnvironmentalData) => {
    const preset = PRESET_CITY_COORDINATES[city.location];
    if (preset) {
      await loadTelemetryForCoordinates(preset.lat, preset.lon, preset.location, preset.country);
    } else if (city.coordinates) {
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
    await loadTelemetryForCoordinates(lat, lon, locationName, countryName);
  };

  // Handler for "Use My Location" (GPS)
  const handleUseMyLocation = async () => {
    setIsLoadingTelemetry(true);
    setTelemetryError(null);
    try {
      const coords = await getUserCoordinates();
      const geoInfo = await reverseGeocode(coords.latitude, coords.longitude);
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

  // On initial mount: automatically fetch real-time telemetry for default city
  useEffect(() => {
    const initialPreset = PRESET_CITY_COORDINATES['San Francisco, CA'];
    if (initialPreset) {
      loadTelemetryForCoordinates(
        initialPreset.lat,
        initialPreset.lon,
        initialPreset.location,
        initialPreset.country
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
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200 relative font-sans">
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
      <footer className="w-full border-t border-zinc-800/80 py-8 px-4 sm:px-8 text-center text-xs text-zinc-400 bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>© 2024 AEROCARE AI SYSTEMS</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-medium">
            <span className="hover:text-zinc-400 transition-colors">GDPR Compliant Data</span>
            <span className="hover:text-zinc-400 transition-colors">Clinical Validation v4.1</span>
            <span className="hover:text-zinc-400 transition-colors">Protocol 882-X</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

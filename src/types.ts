export type ThemeMode = 'dark' | 'light';

export type AgeGroup = 'child' | 'adult' | 'senior';
export type HealthCondition = 'healthy' | 'asthma' | 'heart_condition';
export type Lifestyle = 'student' | 'office_worker' | 'outdoor_worker';
export type OutdoorExposure = 'low' | 'medium' | 'high';

export interface UserProfile {
  ageGroup: AgeGroup;
  healthCondition: HealthCondition;
  lifestyle: Lifestyle;
  outdoorExposure: OutdoorExposure;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface HourlyPointData {
  time: string; // e.g. "00:00", "03:00", ...
  hour: number;
  temp: number;
  aqi: number;
  humidity: number;
  uv: number;
  isProjected?: boolean;
}

export interface EnvironmentalData {
  location: string;
  country: string;
  temperature: number; // in Celsius
  feelsLike: number;
  humidity: number; // percentage
  windSpeed: number; // km/h
  windDirection: string;
  uvIndex: number; // 0-12
  aqi: number; // 0-500
  aqiCategory: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pollutants: {
    pm25: number; // µg/m³
    pm10: number; // µg/m³
    o3: number;   // ppb
    no2: number;  // ppb
    co: number;   // ppm
  };
  weatherCondition: 'Clear' | 'Partly Cloudy' | 'Hazy' | 'Overcast' | 'Breezy';
  lastUpdated: string;
  isRealTelemetry?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  hourlyData?: HourlyPointData[];
}

export interface LocationSearchResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  label: string;
}

export type WeatherVisualType = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'storm' | 'poor_aqi';

export interface BiologicalImpact {
  category: 'respiratory' | 'cardiovascular' | 'cognitive' | 'skinUv';
  title: string;
  percentage: number; // 0-100
  status: 'optimal' | 'guarded' | 'elevated' | 'critical';
  details: string;
}

export interface HealthRiskAssessment {
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  primaryDriver: string;
  advisoryHeadline: string;
  advisorySummary: string;
  biologicalImpacts: BiologicalImpact[];
  keyPrecautions: string[];
}

export interface TimeSlotRecommendation {
  period: 'morning' | 'afternoon' | 'evening';
  title: string;
  timeRange: string;
  temp: number;
  aqi: number;
  uv: number;
  activityRating: 'Recommended' | 'Caution' | 'Avoid';
  summary: string;
  ventilation: string;
  maskAdvised: boolean;
  maskType?: string;
  keyAction: string;
}

export interface DayPlan {
  morning: TimeSlotRecommendation;
  afternoon: TimeSlotRecommendation;
  evening: TimeSlotRecommendation;
}

export interface HourlyTrendPoint {
  time: string;
  hour: number;
  aqi: number;
  temp: number;
  humidity: number;
  uv: number;
  riskScore: number;
  riskLevel: RiskLevel;
}

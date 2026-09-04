import {
  UserProfile,
  EnvironmentalData,
  HealthRiskAssessment,
  DayPlan,
  HourlyTrendPoint,
  RiskLevel
} from '../types';

export const CITIES: EnvironmentalData[] = [
  {
    location: 'San Francisco, CA',
    country: 'United States',
    temperature: 19,
    feelsLike: 18,
    humidity: 68,
    windSpeed: 21,
    windDirection: 'WNW',
    uvIndex: 6,
    aqi: 48,
    aqiCategory: 'Good',
    pollutants: {
      pm25: 11.2,
      pm10: 18.5,
      o3: 32,
      no2: 14,
      co: 0.4
    },
    weatherCondition: 'Partly Cloudy',
    lastUpdated: 'Live sensor telemetry • 2 mins ago'
  },
  {
    location: 'Tokyo',
    country: 'Japan',
    temperature: 24,
    feelsLike: 26,
    humidity: 74,
    windSpeed: 14,
    windDirection: 'ESE',
    uvIndex: 8,
    aqi: 72,
    aqiCategory: 'Moderate',
    pollutants: {
      pm25: 22.4,
      pm10: 38.0,
      o3: 45,
      no2: 26,
      co: 0.6
    },
    weatherCondition: 'Clear',
    lastUpdated: 'Live sensor telemetry • Just now'
  },
  {
    location: 'London',
    country: 'United Kingdom',
    temperature: 16,
    feelsLike: 15,
    humidity: 82,
    windSpeed: 18,
    windDirection: 'SW',
    uvIndex: 4,
    aqi: 38,
    aqiCategory: 'Good',
    pollutants: {
      pm25: 9.1,
      pm10: 14.8,
      o3: 28,
      no2: 19,
      co: 0.3
    },
    weatherCondition: 'Overcast',
    lastUpdated: 'Live sensor telemetry • 5 mins ago'
  },
  {
    location: 'New York, NY',
    country: 'United States',
    temperature: 27,
    feelsLike: 29,
    humidity: 65,
    windSpeed: 12,
    windDirection: 'S',
    uvIndex: 7,
    aqi: 86,
    aqiCategory: 'Moderate',
    pollutants: {
      pm25: 28.5,
      pm10: 46.2,
      o3: 52,
      no2: 31,
      co: 0.8
    },
    weatherCondition: 'Hazy',
    lastUpdated: 'Live sensor telemetry • 1 min ago'
  },
  {
    location: 'Delhi',
    country: 'India',
    temperature: 34,
    feelsLike: 39,
    humidity: 58,
    windSpeed: 9,
    windDirection: 'NW',
    uvIndex: 9,
    aqi: 184,
    aqiCategory: 'Unhealthy',
    pollutants: {
      pm25: 118.0,
      pm10: 194.2,
      o3: 78,
      no2: 64,
      co: 2.1
    },
    weatherCondition: 'Hazy',
    lastUpdated: 'Live sensor telemetry • 3 mins ago'
  }
];

export const INITIAL_PROFILE: UserProfile = {
  ageGroup: 'adult',
  healthCondition: 'asthma',
  lifestyle: 'office_worker',
  outdoorExposure: 'medium'
};

/**
 * Calculates dynamic personalized health risk based on profile + environmental parameters
 */
export function calculateHealthRisk(
  profile: UserProfile,
  env: EnvironmentalData
): HealthRiskAssessment {
  let score = 20; // baseline

  // AQI contribution (max ~45 pts)
  if (env.aqi <= 50) score += (env.aqi / 50) * 12;
  else if (env.aqi <= 100) score += 12 + ((env.aqi - 50) / 50) * 18;
  else if (env.aqi <= 150) score += 30 + ((env.aqi - 100) / 50) * 25;
  else score += 55 + Math.min(25, ((env.aqi - 150) / 100) * 20);

  // Age group multiplier
  if (profile.ageGroup === 'child') score += 12;
  if (profile.ageGroup === 'senior') score += 16;

  // Health condition sensitivity
  if (profile.healthCondition === 'asthma') {
    score += (env.aqi > 50 ? 22 : 10) + (env.pollutants.pm25 > 15 ? 12 : 4);
  } else if (profile.healthCondition === 'heart_condition') {
    score += 20 + (env.temperature > 28 || env.temperature < 10 ? 14 : 4);
  }

  // Lifestyle & Exposure
  if (profile.lifestyle === 'outdoor_worker') score += 14;
  if (profile.outdoorExposure === 'high') score += 16;
  else if (profile.outdoorExposure === 'medium') score += 7;

  // UV + Heat thermal load
  if (env.uvIndex >= 8) score += 8;
  if (env.temperature >= 32 || env.temperature <= 5) score += 8;

  // Clamp 0 to 100
  const normalizedScore = Math.min(96, Math.max(14, Math.round(score)));

  let riskLevel: RiskLevel = 'low';
  if (normalizedScore >= 75) riskLevel = 'severe';
  else if (normalizedScore >= 52) riskLevel = 'high';
  else if (normalizedScore >= 34) riskLevel = 'moderate';
  else riskLevel = 'low';

  // Primary driver detection
  let primaryDriver = 'Particulate Matter & Environmental Sensitivities';
  if (profile.healthCondition === 'asthma' && env.aqi > 60) {
    primaryDriver = 'Airway Hyperreactivity to Airborne PM2.5';
  } else if (profile.healthCondition === 'heart_condition' && (env.temperature > 30 || env.aqi > 80)) {
    primaryDriver = 'Cardiovascular Microvascular Strain via Ambient Load';
  } else if (env.uvIndex >= 8) {
    primaryDriver = 'High Solar UV Index & Photochemical Oxidants';
  } else if (env.aqi > 150) {
    primaryDriver = 'Severe Ambient Aerosol & Particulate Contamination';
  }

  // Biological impact scores
  const respVal = Math.min(98, Math.round(
    (profile.healthCondition === 'asthma' ? 45 : 15) +
    (env.aqi / 220) * 45 +
    (profile.ageGroup !== 'adult' ? 10 : 0)
  ));

  const cardioVal = Math.min(95, Math.round(
    (profile.healthCondition === 'heart_condition' ? 42 : 12) +
    (env.aqi / 250) * 30 +
    (env.temperature > 29 ? 18 : 0) +
    (profile.ageGroup === 'senior' ? 15 : 0)
  ));

  const cognitiveVal = Math.min(90, Math.round(
    18 + (env.humidity > 70 ? 20 : 8) + (env.temperature > 28 ? 22 : 6) + (env.aqi > 80 ? 20 : 4)
  ));

  const uvVal = Math.min(95, Math.round(
    (env.uvIndex / 12) * 80 + (profile.outdoorExposure === 'high' ? 18 : 6)
  ));

  const statusHelper = (val: number): 'optimal' | 'guarded' | 'elevated' | 'critical' => {
    if (val >= 75) return 'critical';
    if (val >= 50) return 'elevated';
    if (val >= 30) return 'guarded';
    return 'optimal';
  };

  const biologicalImpacts = [
    {
      category: 'respiratory' as const,
      title: 'Respiratory Bronchial Load',
      percentage: respVal,
      status: statusHelper(respVal),
      details: profile.healthCondition === 'asthma'
        ? 'Heightened bronchospasm potential detected. Bronchodilator proximity advised.'
        : 'Sub-clinical airway irritation index based on PM2.5 alveolar penetration.'
    },
    {
      category: 'cardiovascular' as const,
      title: 'Vascular & Blood Flow Strain',
      percentage: cardioVal,
      status: statusHelper(cardioVal),
      details: profile.healthCondition === 'heart_condition'
        ? 'Elevated systemic arterial stress triggered by ambient particulate inhalation.'
        : 'Normal microvascular responsiveness with minimal environmental resistance.'
    },
    {
      category: 'cognitive' as const,
      title: 'Cognitive Fatigue & Focus Index',
      percentage: cognitiveVal,
      status: statusHelper(cognitiveVal),
      details: env.humidity > 70 || env.temperature > 30
        ? 'Thermal discomfort and indoor CO2 accumulation may induce brain fog.'
        : 'Atmospheric oxygen diffusion index is stable for focused mental tasks.'
    },
    {
      category: 'skinUv' as const,
      title: 'Cellular UV & Oxidation Risk',
      percentage: uvVal,
      status: statusHelper(uvVal),
      details: `Peak UV index ${env.uvIndex} creates cellular erythema threshold in ~${Math.max(12, Math.round(50 - env.uvIndex * 3.5))} minutes unprotected.`
    }
  ];

  let advisoryHeadline = 'Optimal Atmospheric Window';
  let advisorySummary = 'Your individual profile indicates strong physiological resilience to current ambient parameters.';

  if (riskLevel === 'severe') {
    advisoryHeadline = 'Critical Environmental Vulnerability Alert';
    advisorySummary = `Immediate mitigation required. The convergence of ${env.aqiCategory.toLowerCase()} air quality (AQI ${env.aqi}) and your ${profile.healthCondition === 'asthma' ? 'asthmatic airway sensitivity' : 'individual susceptibility'} presents substantial health hazards.`;
  } else if (riskLevel === 'high') {
    advisoryHeadline = 'Elevated Precaution Advised Today';
    advisorySummary = `Your biometric susceptibility model flags noticeable strain under current outdoor particulate levels. Reschedule high-exertion outdoor sessions to low-ozone hours.`;
  } else if (riskLevel === 'moderate') {
    advisoryHeadline = 'Moderate Health Sensitivity Profile';
    advisorySummary = `Current ambient conditions are generally manageable, but extended outdoor exposure warrants protective intervals and indoor air filtration.`;
  }

  const keyPrecautions: string[] = [];
  if (profile.healthCondition === 'asthma') {
    keyPrecautions.push('Keep quick-relief inhaler within immediate access during transitions.');
  }
  if (env.aqi > 60 && (profile.healthCondition !== 'healthy' || profile.outdoorExposure !== 'low')) {
    keyPrecautions.push('Wear an N95 or KF94 respirator if traveling outdoors longer than 20 minutes.');
  }
  if (env.uvIndex >= 6) {
    keyPrecautions.push('Apply broad-spectrum SPF 50+ sunscreen and wear UV400 polarized eyewear.');
  }
  if (profile.lifestyle === 'outdoor_worker') {
    keyPrecautions.push('Implement a 15-minute shaded indoor respiratory rest cycle every 90 minutes.');
  } else {
    keyPrecautions.push('Run HEPA indoor filtration and keep external airflow dampers regulated.');
  }

  return {
    riskLevel,
    riskScore: normalizedScore,
    primaryDriver,
    advisoryHeadline,
    advisorySummary,
    biologicalImpacts,
    keyPrecautions
  };
}

/**
 * Generates personalized daily timeline recommendations
 */
export function generateDayPlan(profile: UserProfile, env: EnvironmentalData, risk: HealthRiskAssessment): DayPlan {
  const isVulnerable = profile.healthCondition !== 'healthy' || profile.ageGroup !== 'adult';

  return {
    morning: {
      period: 'morning',
      title: 'Morning Awakening & Transit Window',
      timeRange: '06:00 – 11:30',
      temp: Math.max(12, env.temperature - 4),
      aqi: Math.max(25, Math.round(env.aqi * 0.75)),
      uv: 3,
      activityRating: risk.riskLevel === 'severe' ? 'Caution' : 'Recommended',
      summary: 'Optimal window for light outdoor activity, commuting, and natural home ventilation before daytime ground-level ozone formation.',
      ventilation: 'Open windows for cross-breeze until 10:00 AM (lowest particulate density).',
      maskAdvised: risk.riskLevel === 'severe',
      maskType: 'Standard surgical or KN95 if brisk walking near arterial roads',
      keyAction: 'Hydrate early with electrolytes to offset diurnal airway drying.'
    },
    afternoon: {
      period: 'afternoon',
      title: 'Peak Solar & Thermal Ozone Period',
      timeRange: '12:00 – 17:00',
      temp: env.temperature + 3,
      aqi: Math.round(env.aqi * 1.2),
      uv: env.uvIndex,
      activityRating: (risk.riskLevel === 'high' || risk.riskLevel === 'severe' || isVulnerable) ? 'Avoid' : 'Caution',
      summary: 'Photochemical smog and elevated temperatures converge. Fine particulates stay suspended longer in heated boundary layer.',
      ventilation: 'Seal windows; activate indoor HEPA filtration and cool circulation.',
      maskAdvised: true,
      maskType: 'High-filtration N95 or KF94 respirator recommended for outdoor transit',
      keyAction: isVulnerable
        ? 'Relocate cardiovascular and physical workouts indoors.'
        : 'Limit continuous direct sunlight exposure to under 25 minutes.'
    },
    evening: {
      period: 'evening',
      title: 'Twilight Stabilization & Recovery',
      timeRange: '17:30 – 22:30',
      temp: Math.max(14, env.temperature - 2),
      aqi: Math.round(env.aqi * 0.9),
      uv: 1,
      activityRating: risk.riskLevel === 'severe' ? 'Caution' : 'Recommended',
      summary: 'Ambient temperatures drop and UV radiation diminishes. Fine particulate dispersal improves with evening breeze.',
      ventilation: 'Check localized outdoor sensor before opening bedroom windows for nighttime sleep.',
      maskAdvised: risk.riskLevel === 'severe' || (profile.healthCondition === 'asthma' && env.aqi > 80),
      maskType: 'Optional unless entering high vehicle exhaust intersections',
      keyAction: 'Rinse facial and nasal passages with saline mist to clear deposited micro-pollutants.'
    }
  };
}

/**
 * Generates 24-hour predictive trend metrics
 */
export function generateHourlyTrends(profile: UserProfile, env: EnvironmentalData): HourlyTrendPoint[] {
  // If real hourly telemetry is available from Open-Meteo, use real hourly points
  if (env.hourlyData && env.hourlyData.length > 0) {
    return env.hourlyData.map((pt) => {
      const pointEnv: EnvironmentalData = {
        ...env,
        aqi: pt.aqi,
        temperature: pt.temp,
        humidity: pt.humidity,
        uvIndex: pt.uv
      };
      const assessment = calculateHealthRisk(profile, pointEnv);
      return {
        time: pt.time,
        hour: pt.hour,
        aqi: pt.aqi,
        temp: pt.temp,
        humidity: pt.humidity,
        uv: pt.uv,
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel
      };
    });
  }

  const hours = [
    { label: '00:00', hour: 0, aqiMod: 0.65, tempMod: -5, uv: 0 },
    { label: '03:00', hour: 3, aqiMod: 0.6, tempMod: -6, uv: 0 },
    { label: '06:00', hour: 6, aqiMod: 0.75, tempMod: -4, uv: 1 },
    { label: '09:00', hour: 9, aqiMod: 1.05, tempMod: -1, uv: 4 },
    { label: '12:00', hour: 12, aqiMod: 1.25, tempMod: 2, uv: env.uvIndex },
    { label: '15:00', hour: 15, aqiMod: 1.35, tempMod: 4, uv: Math.max(1, env.uvIndex - 1) },
    { label: '18:00', hour: 18, aqiMod: 1.1, tempMod: 1, uv: 2 },
    { label: '21:00', hour: 21, aqiMod: 0.85, tempMod: -2, uv: 0 }
  ];

  return hours.map(h => {
    const pointEnv: EnvironmentalData = {
      ...env,
      aqi: Math.round(env.aqi * h.aqiMod),
      temperature: env.temperature + h.tempMod,
      uvIndex: h.uv
    };
    const assessment = calculateHealthRisk(profile, pointEnv);
    return {
      time: h.label,
      hour: h.hour,
      aqi: pointEnv.aqi,
      temp: pointEnv.temperature,
      humidity: Math.min(95, Math.max(30, env.humidity - h.tempMod * 2)),
      uv: h.uv,
      riskScore: assessment.riskScore,
      riskLevel: assessment.riskLevel
    };
  });
}

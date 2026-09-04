import {
  EnvironmentalData,
  HourlyPointData,
  LocationSearchResult
} from '../types';

// Cache expiration: 10 minutes in milliseconds
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_PREFIX = 'aerocare_telemetry_';

// 16-point compass directions for wind bearing conversion
const COMPASS_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
];

/**
 * Converts wind bearing degrees (0-360) into 16-point compass string
 */
export function degreesToCompass(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return COMPASS_DIRECTIONS[index] || 'N';
}

/**
 * Maps WMO weather interpretation codes to AeroCare weather condition categories
 */
export function mapWmoToWeatherCondition(
  code: number,
  windSpeed: number
): 'Clear' | 'Partly Cloudy' | 'Hazy' | 'Overcast' | 'Breezy' {
  if (windSpeed >= 28) return 'Breezy';

  // 0: Clear sky
  if (code === 0) return 'Clear';
  // 1, 2: Mainly clear, partly cloudy
  if (code === 1 || code === 2) return 'Partly Cloudy';
  // 3: Overcast
  if (code === 3) return 'Overcast';
  // 45, 48: Fog / Depositing rime fog
  if (code === 45 || code === 48) return 'Hazy';
  // 51, 53, 55, 56, 57: Drizzle
  if (code >= 51 && code <= 57) return 'Overcast';
  // 61, 63, 65, 66, 67: Rain
  if (code >= 61 && code <= 67) return 'Overcast';
  // 71, 73, 75, 77: Snow
  if (code >= 71 && code <= 77) return 'Overcast';
  // 80, 81, 82: Rain showers
  if (code >= 80 && code <= 82) return 'Partly Cloudy';
  // 95, 96, 99: Thunderstorm
  if (code >= 95 && code <= 99) return 'Overcast';

  return 'Partly Cloudy';
}

/**
 * Categorizes US AQI into standard EPA classifications
 */
export function getAqiCategory(
  aqi: number
): 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Preset coordinates for instant switching of demo cities
 */
export const PRESET_CITY_COORDINATES: Record<string, { lat: number; lon: number; location: string; country: string }> = {
  'San Francisco, CA': { lat: 37.7749, lon: -122.4194, location: 'San Francisco, CA', country: 'United States' },
  'Tokyo': { lat: 35.6895, lon: 139.6917, location: 'Tokyo', country: 'Japan' },
  'London': { lat: 51.5074, lon: -0.1278, location: 'London', country: 'United Kingdom' },
  'New Delhi': { lat: 28.6139, lon: 77.2090, location: 'New Delhi', country: 'India' },
  'Sydney': { lat: -33.8688, lon: 151.2093, location: 'Sydney', country: 'Australia' }
};

/**
 * Global location search using Open-Meteo Geocoding API
 */
export async function searchGlobalLocations(
  query: string,
  signal?: AbortSignal
): Promise<LocationSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=en&format=json`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`Geocoding HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: any) => {
      const parts = [item.name];
      if (item.admin1 && item.admin1 !== item.name) parts.push(item.admin1);
      if (item.country) parts.push(item.country);

      return {
        id: item.id,
        name: item.name,
        country: item.country || '',
        admin1: item.admin1,
        latitude: item.latitude,
        longitude: item.longitude,
        label: parts.join(', ')
      };
    });
  } catch (err: any) {
    if (err.name === 'AbortError') return [];
    console.warn('Location search error:', err);
    return [];
  }
}

/**
 * Reverse geocoding via Nominatim with fallback
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ location: string; country: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AeroCareAI-Telemetry/1.0' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.county ||
        data.name ||
        'Local Sensor Station';
      const countryName = addr.country || 'Detected Region';
      const stateName = addr.state;

      const locationLabel = stateName && !cityName.includes(stateName)
        ? `${cityName}, ${stateName}`
        : cityName;

      return {
        location: locationLabel,
        country: countryName
      };
    }
  } catch {
    // Non-blocking fallback
  }

  return {
    location: `Position (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
    country: 'Observed Telemetry'
  };
}

/**
 * Acquires browser coordinates via native Geolocation API
 */
export function getUserCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let msg = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission was denied. You can still search for any city.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out.';
            break;
        }
        const err = new Error(msg);
        (err as any).code = error.code;
        (err as any).isDenied = error.code === error.PERMISSION_DENIED;
        reject(err);
      },
      {
        enableHighAccuracy: false,
        timeout: 9000,
        maximumAge: 60000
      }
    );
  });
}

/**
 * Normalizes Open-Meteo Weather + Air Quality APIs into AeroCare EnvironmentalData
 */
export async function fetchRealTimeEnvironmentalData(
  lat: number,
  lon: number,
  locationName?: string,
  countryName?: string,
  bypassCache = false
): Promise<EnvironmentalData> {
  const cacheKey = `${CACHE_PREFIX}${lat.toFixed(3)}_${lon.toFixed(3)}`;

  // 1. Check client-side storage cache if not bypassing
  if (!bypassCache) {
    try {
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        const age = Date.now() - (cached.timestamp || 0);
        if (age < CACHE_TTL_MS && cached.data) {
          return cached.data;
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }

  // 2. Build Open-Meteo Endpoints
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,uv_index,wind_speed_10m,weather_code&timezone=auto&forecast_days=2&past_days=1`;
  const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,carbon_monoxide&hourly=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,carbon_monoxide&timezone=auto&forecast_days=2&past_days=1`;

  // 3. Fetch in parallel using Promise.all
  const [weatherRes, airRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(airQualityUrl)
  ]);

  if (!weatherRes.ok) {
    throw new Error(`Weather Telemetry Service error (${weatherRes.status})`);
  }
  if (!airRes.ok) {
    throw new Error(`Air Quality Telemetry Service error (${airRes.status})`);
  }

  const [weatherData, airData] = await Promise.all([
    weatherRes.json(),
    airRes.json()
  ]);

  const currentW = weatherData.current || {};
  const currentA = airData.current || {};

  // Extract core metrics
  const tempC = Math.round(currentW.temperature_2m ?? 20);
  const feelsLikeC = Math.round(currentW.apparent_temperature ?? tempC);
  const humidity = Math.round(currentW.relative_humidity_2m ?? 60);
  const windSpeed = Math.round(currentW.wind_speed_10m ?? 12);
  const windDegrees = currentW.wind_direction_10m ?? 0;
  const windDir = degreesToCompass(windDegrees);
  const uv = Math.min(12, Math.max(0, Math.round(currentW.uv_index ?? 0)));
  const weatherCode = currentW.weather_code ?? 1;
  const weatherCond = mapWmoToWeatherCondition(weatherCode, windSpeed);

  // Pollutants & AQI
  const rawAqi = currentA.us_aqi;
  const aqiVal = typeof rawAqi === 'number' ? Math.round(rawAqi) : 42;
  const aqiCategory = getAqiCategory(aqiVal);

  const pm25 = Number((currentA.pm2_5 ?? 10.5).toFixed(1));
  const pm10 = Number((currentA.pm10 ?? 18.0).toFixed(1));
  const o3 = Math.round(currentA.ozone ?? 32);
  const no2 = Math.round(currentA.nitrogen_dioxide ?? 16);
  // Carbon monoxide: Open-Meteo returns µg/m³, AeroCare uses ppm (1 ppm ≈ 1145 µg/m³)
  const coRaw = currentA.carbon_monoxide;
  const coPpm = coRaw ? Number((coRaw / 1145).toFixed(1)) : 0.4;

  // 4. Extract Real Hourly Trend Points matching AeroCare's 8 diurnal milestone hours
  // Milestones: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00
  const milestoneHours = [
    { label: '00:00', hour: 0 },
    { label: '03:00', hour: 3 },
    { label: '06:00', hour: 6 },
    { label: '09:00', hour: 9 },
    { label: '12:00', hour: 12 },
    { label: '15:00', hour: 15 },
    { label: '18:00', hour: 18 },
    { label: '21:00', hour: 21 },
  ];

  const hourlyW = weatherData.hourly || {};
  const hourlyA = airData.hourly || {};
  const timeArray: string[] = hourlyW.time || [];

  // Determine current time in the local timezone of the sensor
  const currentIsoTime: string = currentW.time || '';
  const currentHourNum = currentIsoTime.includes('T')
    ? parseInt(currentIsoTime.split('T')[1].split(':')[0], 10)
    : new Date().getHours();
  const currentDateStr = currentIsoTime.split('T')[0] || new Date().toISOString().split('T')[0];

  const hourlyData: HourlyPointData[] = milestoneHours.map((m) => {
    // Format target ISO prefix: e.g. "2026-09-04T06:00"
    const hourStr = m.hour.toString().padStart(2, '0');
    const targetIso = `${currentDateStr}T${hourStr}:00`;
    let foundIdx = timeArray.findIndex((t) => t.startsWith(targetIso));

    // Fallback: search by hour suffix
    if (foundIdx === -1) {
      foundIdx = timeArray.findIndex((t) => t.endsWith(`T${hourStr}:00`));
    }

    let ptTemp = tempC;
    let ptAqi = aqiVal;
    let ptHumidity = humidity;
    let ptUv = 0;

    if (foundIdx !== -1) {
      if (Array.isArray(hourlyW.temperature_2m) && hourlyW.temperature_2m[foundIdx] !== undefined) {
        ptTemp = Math.round(hourlyW.temperature_2m[foundIdx]);
      }
      if (Array.isArray(hourlyW.relative_humidity_2m) && hourlyW.relative_humidity_2m[foundIdx] !== undefined) {
        ptHumidity = Math.round(hourlyW.relative_humidity_2m[foundIdx]);
      }
      if (Array.isArray(hourlyW.uv_index) && hourlyW.uv_index[foundIdx] !== undefined) {
        ptUv = Math.round(hourlyW.uv_index[foundIdx]);
      }
      if (Array.isArray(hourlyA.us_aqi) && hourlyA.us_aqi[foundIdx] !== undefined) {
        ptAqi = Math.round(hourlyA.us_aqi[foundIdx]);
      }
    } else {
      // Gentle synthetic modulation if hour slice wasn't in array
      const delta = (m.hour - 12) / 6;
      ptTemp = Math.round(tempC - Math.abs(delta) * 3);
      ptAqi = Math.round(aqiVal * (1 + delta * 0.1));
    }

    return {
      time: m.label,
      hour: m.hour,
      temp: ptTemp,
      aqi: ptAqi,
      humidity: ptHumidity,
      uv: ptUv,
      isProjected: m.hour > currentHourNum
    };
  });

  // Telemetry timestamp
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const finalData: EnvironmentalData = {
    location: locationName || 'Selected Location',
    country: countryName || 'Real Telemetry',
    temperature: tempC,
    feelsLike: feelsLikeC,
    humidity,
    windSpeed,
    windDirection: windDir,
    uvIndex: uv,
    aqi: aqiVal,
    aqiCategory,
    pollutants: {
      pm25,
      pm10,
      o3,
      no2,
      co: coPpm
    },
    weatherCondition: weatherCond,
    lastUpdated: `LIVE TELEMETRY • UPDATED ${timeString}`,
    isRealTelemetry: true,
    coordinates: {
      latitude: lat,
      longitude: lon
    },
    hourlyData
  };

  // Cache in localStorage
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data: finalData
    }));
  } catch {
    // Ignore storage quota limits
  }

  return finalData;
}

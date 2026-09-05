import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const {
      environmentalData,
      userProfile,
      assessment,
    } = req.body;

    if (!environmentalData || !userProfile || !assessment) {
      return res.status(400).json({
        error: "Missing required environmental, profile, or risk data",
      });
    }

    const prompt = `
You are AeroCare AI, an environmental health intelligence assistant.

Generate a concise and personalized environmental health advisory using ONLY the structured information below.

IMPORTANT RULES:
- Do NOT diagnose diseases.
- Do NOT claim to replace a doctor.
- Provide general environmental health guidance only.
- Clearly explain the main environmental risk.
- Make recommendations practical and personalized.
- Keep the response between 80 and 140 words.
- Do not invent measurements or conditions not provided.
- Use a confident, intelligent but easy-to-understand tone.

LOCATION:
${environmentalData.location}, ${environmentalData.country}

LIVE ENVIRONMENTAL TELEMETRY:
Temperature: ${environmentalData.temperature}°C
Feels Like: ${environmentalData.feelsLike}°C
Humidity: ${environmentalData.humidity}%
Wind Speed: ${environmentalData.windSpeed} km/h
Wind Direction: ${environmentalData.windDirection}
UV Index: ${environmentalData.uvIndex}
Weather Condition: ${environmentalData.weatherCondition}

AIR QUALITY:
US AQI: ${environmentalData.aqi}
AQI Category: ${environmentalData.aqiCategory}
PM2.5: ${environmentalData.pollutants.pm25} µg/m³
PM10: ${environmentalData.pollutants.pm10} µg/m³
Ozone: ${environmentalData.pollutants.o3} ppb
Nitrogen Dioxide: ${environmentalData.pollutants.no2} ppb
Carbon Monoxide: ${environmentalData.pollutants.co} ppm

USER PROFILE:
Age Group: ${userProfile.ageGroup}
Health Condition: ${userProfile.healthCondition}
Lifestyle: ${userProfile.lifestyle}
Outdoor Exposure: ${userProfile.outdoorExposure}

AEROCARE RISK ENGINE RESULTS:
Risk Level: ${assessment.riskLevel}
Risk Score: ${assessment.riskScore}/100
Primary Environmental Driver: ${assessment.primaryDriver}
Current Advisory Headline: ${assessment.advisoryHeadline}

Generate one personalized AeroCare AI advisory now.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const advisory =
      response.text ||
      "AeroCare has analyzed your current environmental conditions. Review your risk indicators and follow the recommended precautions.";

    return res.status(200).json({
      advisory,
    });

  } catch (error) {
    console.error("Gemini Advisory Error:", error);

    return res.status(500).json({
      error: "Unable to generate AI advisory",
    });
  }
}
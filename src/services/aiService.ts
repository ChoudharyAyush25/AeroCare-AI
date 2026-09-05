import { GoogleGenAI } from "@google/genai";

import type {
  UserProfile,
  EnvironmentalData,
  HealthRiskAssessment
} from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export async function getAIHealthAdvice(
  profile: UserProfile,
  environment: EnvironmentalData,
  assessment: HealthRiskAssessment
): Promise<string> {

  console.log("Gemini API Key available:", !!apiKey);

  if (!apiKey) {
    throw new Error("Gemini API key is missing!");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey
  });

  const prompt = `
You are an AI environmental health assistant.

Based on the following user profile and environmental conditions,
provide personalized health and safety advice.

USER PROFILE:
Age Group: ${profile.ageGroup}
Health Condition: ${profile.healthCondition}
Lifestyle: ${profile.lifestyle}
Outdoor Exposure: ${profile.outdoorExposure}

ENVIRONMENT:
Location: ${environment.location}
Temperature: ${environment.temperature}°C
Humidity: ${environment.humidity}%
AQI: ${environment.aqi}
AQI Category: ${environment.aqiCategory}
UV Index: ${environment.uvIndex}
Weather: ${environment.weatherCondition}

CALCULATED RISK:
Risk Level: ${assessment.riskLevel}
Risk Score: ${assessment.riskScore}/100
Primary Driver: ${assessment.primaryDriver}

Give a concise response with:

1. Overall health advice
2. Main precautions
3. Best time for outdoor activities

Important: This is general wellness information, not a medical diagnosis.

Keep the response under 180 words.
`;

  try {
    console.log("Sending request to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt
    });

    console.log("Gemini response:", response);

    const advice = response.text;

    if (!advice) {
      throw new Error("Gemini returned an empty response.");
    }

    return advice;

  } catch (error) {

    console.error("❌ Gemini API Error:", error);

    throw error;
  }
}
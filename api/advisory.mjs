import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing on server");

      return res.status(500).json({
        error: "Gemini API key is not configured",
      });
    }

    const {
      environmentalData,
      userProfile,
      assessment,
    } = req.body;

    if (!environmentalData || !userProfile || !assessment) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const prompt = `
You are AeroCare AI, an environmental health intelligence assistant.

Provide concise, personalized general wellness advice based on the following data.

Do not diagnose diseases.
Do not replace professional medical advice.
Do not invent information that was not provided.

LOCATION:
${environmentalData.location}, ${environmentalData.country}

ENVIRONMENT:
Temperature: ${environmentalData.temperature}°C
Feels Like: ${environmentalData.feelsLike}°C
Humidity: ${environmentalData.humidity}%
AQI: ${environmentalData.aqi}
AQI Category: ${environmentalData.aqiCategory}
UV Index: ${environmentalData.uvIndex}
Weather: ${environmentalData.weatherCondition}

USER PROFILE:
Age Group: ${userProfile.ageGroup}
Health Condition: ${userProfile.healthCondition}
Lifestyle: ${userProfile.lifestyle}
Outdoor Exposure: ${userProfile.outdoorExposure}

RISK ASSESSMENT:
Risk Level: ${assessment.riskLevel}
Risk Score: ${assessment.riskScore}/100
Primary Driver: ${assessment.primaryDriver}

Give:
1. Overall health advice
2. Main precautions
3. Outdoor activity recommendation

Keep the response between 80 and 140 words.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const advisory =
      response.text ||
      "AeroCare has analyzed your environmental conditions. Please follow the recommended precautions.";

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

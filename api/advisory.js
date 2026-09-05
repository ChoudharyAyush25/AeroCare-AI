import type {
  UserProfile,
  EnvironmentalData,
  HealthRiskAssessment,
} from "../types";

export async function getAIHealthAdvice(
  userProfile: UserProfile,
  environmentalData: EnvironmentalData,
  assessment: HealthRiskAssessment
): Promise<string> {
  try {
    console.log("Sending request to AeroCare AI API...");

    const response = await fetch("/api/advisory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        environmentalData,
        userProfile,
        assessment,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to generate AI advisory");
    }

    return data.advisory;
  } catch (error) {
    console.error("Gemini AI Error:", error);

    return "AI advice is temporarily unavailable. Please follow the environmental precautions shown above.";
  }
}

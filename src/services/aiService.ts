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
        userProfile,
        environmentalData,
        assessment,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);

      throw new Error(
        errorData.error || "Unable to generate AI advisory"
      );
    }

    const data = await response.json();

    return data.advisory;
  } catch (error) {
    console.error("Gemini AI Error:", error);

    return "AI advice is temporarily unavailable. Please follow the environmental precautions shown above.";
  }
}
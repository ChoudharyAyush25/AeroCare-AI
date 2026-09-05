import type {
  UserProfile,
  EnvironmentalData,
  HealthRiskAssessment,
} from "../types";

export async function getAIHealthAdvice(
  profile: UserProfile,
  environment: EnvironmentalData,
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
        environmentalData: environment,
        userProfile: profile,
        assessment: assessment,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("AI API Error:", data);
      throw new Error(data.error || "Unable to generate AI advisory");
    }

    return (
      data.advisory ||
      "AeroCare has analyzed your environmental conditions. Please review the recommended precautions."
    );
  } catch (error) {
    console.error("AeroCare AI Error:", error);

    return "AI advice is temporarily unavailable. Please follow the environmental precautions shown above.";
  }
}

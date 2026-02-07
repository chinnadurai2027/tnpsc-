
import { GoogleGenAI, Type } from "@google/genai";

// Generate a structured daily study plan based on user parameters
export async function generateDailyPlan(dayNum: number, availableHours: number, constraints: string, previousPerformance: string) {
  // Always initialize directly right before the call to ensure latest configuration as per guidelines
  // Use gemini-3-pro-preview for complex reasoning tasks like plan generation
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Act as a TNPSC Group 1 Study Planner. Generate a study plan for Day ${dayNum}.
    Available time: ${availableHours} hours.
    Constraints: ${constraints}.
    Previous performance summary: ${previousPerformance}.
    
    Ensure tasks are concrete and output-driven. Rotate subjects. Include Revision and Current Affairs.
    Total duration must fit within ${availableHours} hours.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            timeEstimate: { type: Type.NUMBER, description: "Duration in minutes" },
            outputExpected: { type: Type.STRING }
          },
          required: ["subject", "topic", "timeEstimate", "outputExpected"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI failed to generate a plan. Please try again.");
  return JSON.parse(text);
}

// Analyze completed study logs to provide actionable feedback
export async function analyzeDailyPerformance(logs: any) {
  // Use gemini-3-pro-preview for complex evaluation and feedback generation
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this TNPSC study log and provide a verdict (Strong/Average/Poor) and ONE precise correction for tomorrow. No generic advice.
      Logs: ${JSON.stringify(logs)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, description: "Performance assessment: Strong, Average, or Poor" },
            correction: { type: Type.STRING, description: "A single, specific tactical improvement for tomorrow" }
          },
          required: ["verdict", "correction"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI failed to analyze performance.");
    return JSON.parse(text);
  } catch (err) {
    console.error("AI analysis failed:", err);
    return { verdict: 'Average', correction: 'Manual review required: AI analysis failed.' };
  }
}

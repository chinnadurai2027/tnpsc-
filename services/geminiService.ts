
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generate a structured daily study plan based on user parameters
export async function generateDailyPlan(dayNum: number, availableHours: number, constraints: string, previousPerformance: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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
}

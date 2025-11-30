import { GoogleGenAI } from "@google/genai";
import { BiomeType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateJournalEntry = async (
  biome: BiomeType,
  timeOfDay: string,
  nearbyFeatures: string[]
): Promise<string> => {
  try {
    const prompt = `
      You are an adventurous explorer writing in a journal. 
      You are currently exploring a ${biome} biome.
      It is currently ${timeOfDay}.
      Nearby features include: ${nearbyFeatures.join(', ') || 'nothing unusual'}.
      
      Write a short, immersive journal entry (max 50 words) describing the atmosphere, what you see, and how you feel.
      Be creative but concise. Do not use markdown headers.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Speed over complex reasoning
      }
    });

    return response.text?.trim() || "The fog is too thick to write anything meaningful...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "My pen has run dry. I cannot record this moment. (API Error)";
  }
};


import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function enhanceIdea(content: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following idea and provide a concise one-sentence summary and 3 relevant tags. Return strictly in JSON format.
      Idea: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A concise one-sentence summary" },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Up to 3 relevant tags"
            }
          },
          required: ["summary", "tags"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Enhancement failed:", error);
    return null;
  }
}

export async function searchWeb(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a deep web scrape and analysis for: "${query}". 
      Provide:
      1. A detailed executive summary.
      2. 3-4 Key Visual Insights (descriptions of what a user would see).
      3. A list of relevant categories.
      
      Respond in Markdown format.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'External Source',
      uri: chunk.web?.uri || '#',
    })).filter((s: any) => s.uri !== '#') || [];

    return { text, sources };
  } catch (error) {
    console.error("Web Search failed:", error);
    return null;
  }
}

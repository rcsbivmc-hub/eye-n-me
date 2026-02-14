
import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any, context: any) => {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { action, payload } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY");
            return { statusCode: 500, body: "Server Error: API Key missing" };
        }

        const ai = new GoogleGenAI({ apiKey });

        if (action === "enhance") {
            const { content } = payload;
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Analyze the following idea and provide a concise one-sentence summary and 3 relevant tags. Return strictly in JSON format.
        Idea: "${content}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            summary: { type: "STRING", description: "A concise one-sentence summary" },
                            tags: {
                                type: "ARRAY",
                                items: { type: "STRING" },
                                description: "Up to 3 relevant tags"
                            }
                        },
                        required: ["summary", "tags"]
                    }
                }
            });
            return {
                statusCode: 200,
                body: JSON.stringify(JSON.parse(response.text))
            };
        }

        if (action === "search") {
            const { query } = payload;
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

            return {
                statusCode: 200,
                body: JSON.stringify({ text, sources })
            };
        }

        return { statusCode: 400, body: "Invalid action" };

    } catch (error: any) {
        console.error("Function error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

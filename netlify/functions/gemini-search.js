// Netlify Serverless Function to securely handle Gemini API web search calls
import { GoogleGenAI } from '@google/genai';

export async function handler(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { query } = JSON.parse(event.body);

        if (!query || typeof query !== 'string') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid query provided' })
            };
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY not configured');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'API configuration error' })
            };
        }

        const genAI = new GoogleGenAI({ apiKey });
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            tools: [{ googleSearch: {} }]
        });

        const result = await model.generateContent(query);
        const response = result.response;

        // Extract grounding metadata (search results)
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingSupports?.map(support => ({
            uri: support.groundingChunkIndices?.[0]
                ? groundingMetadata?.webSearchQueries?.[0] || support.segment?.text || query
                : 'Unknown source',
            title: support.segment?.text?.substring(0, 100) || 'Web Result'
        })) || [];

        // Get unique sources
        const uniqueSources = Array.from(
            new Map(sources.map(s => [s.uri, s])).values()
        ).slice(0, 6);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                text: response.text(),
                sources: uniqueSources
            })
        };

    } catch (error) {
        console.error('Error searching web:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to search web',
                text: 'An error occurred while searching. Please try again.',
                sources: []
            })
        };
    }
}

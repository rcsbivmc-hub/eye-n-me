// Netlify Serverless Function to securely handle Gemini API calls for idea enhancement
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
        const { content } = JSON.parse(event.body);

        if (!content || typeof content !== 'string') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid content provided' })
            };
        }

        // Rate limiting check (basic implementation)
        // In production, use a proper rate limiting service

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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `Analyze this idea and provide:
1. A concise summary (max 50 words)
2. Relevant tags (3-5 keywords)

Idea: "${content}"

Respond in JSON format:
{
  "summary": "...",
  "tags": ["tag1", "tag2", ...]
}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON from response (handle markdown code blocks)
        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
        }

        const aiData = JSON.parse(jsonText);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(aiData)
        };

    } catch (error) {
        console.error('Error enhancing idea:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to enhance idea',
                summary: null,
                tags: []
            })
        };
    }
}

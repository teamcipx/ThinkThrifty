import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const geminiService = {
  analyzeImage: async (base64Data: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: "Analyze this image and provide a professional title, a descriptive caption, and 10 relevant SEO keywords. Return as JSON." },
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            keywords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            },
            suggestedSlug: { type: Type.STRING }
          },
          required: ["title", "description", "keywords", "suggestedSlug"]
        }
      }
    });

    const text = response.text;
    if (typeof text !== 'string') {
      throw new Error("Gemini API returned an invalid or empty response.");
    }

    return JSON.parse(text);
  }
};
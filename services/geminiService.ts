import { GoogleGenAI, Type } from "@google/genai";

export const geminiService = {
  analyzeImage: async (base64Data: string) => {
    // Re-initialize to ensure we use the latest environment variable in the current context
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
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
    if (!text) {
      throw new Error("Gemini API returned an invalid or empty response.");
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", text);
      throw new Error("Invalid format returned from AI analysis.");
    }
  }
};
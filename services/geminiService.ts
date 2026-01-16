import { GoogleGenAI, Type } from "@google/genai";

export const geminiService = {
  analyzeImage: async (base64Data: string) => {
    // Initialize inside the function to ensure the latest API key is used
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
      throw new Error("Gemini API returned an empty response.");
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("AI metadata generation failed due to invalid response format.");
    }
  }
};
import { GoogleGenAI, Type } from "@google/genai";
import type { BannerContent } from "../types";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const analyzeProduct = async (url: string, description: string): Promise<BannerContent> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this product/brand and generate banner ad content.
    URL: ${url}
    Description: ${description}
    
    Provide:
    1. A catchy headline (max 40 chars)
    2. A compelling subheadline (max 80 chars)
    3. A clear CTA (max 15 chars)
    4. A detailed image generation prompt for a high-quality product/lifestyle photo that fits the brand.
    5. Brand colors (hex codes) based on the description or common associations.`,
    config: {
      tools: [{ urlContext: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          subheadline: { type: Type.STRING },
          cta: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
          brandColors: {
            type: Type.OBJECT,
            properties: {
              primary: { type: Type.STRING },
              secondary: { type: Type.STRING },
              accent: { type: Type.STRING },
            },
            required: ["primary", "secondary", "accent"],
          },
        },
        required: ["headline", "subheadline", "cta", "imagePrompt", "brandColors"],
      },
    },
  });

  return JSON.parse(response.text);
};

export const generateBannerImage = async (
  prompt: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "2:3" | "3:2" | "21:9",
  imageSize: "1K" | "2K" | "4K"
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio,
        imageSize,
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

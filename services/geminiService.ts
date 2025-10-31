import { GoogleGenAI, Chat, GenerateContentResponse, GroundingChunk as GenAIGroundingChunk, Type } from "@google/genai";
import { GroundingChunk } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Please set it to use Gemini API.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const analyzeImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Došlo je do pogreške prilikom analize slike.";
  }
};

export const getGroundedAnswer = async (query: string, useMaps: boolean = false, latLng?: { latitude: number; longitude: number }): Promise<{ text: string, sources: GroundingChunk[] }> => {
  try {
    const schoolWebsite = "ss-tehnicka-prometna-st.skole.hr";
    const tools: any[] = useMaps ? [{ googleMaps: {} }] : [{ googleSearch: { uris: [schoolWebsite] } }];
    const toolConfig = useMaps && latLng ? { retrievalConfig: { latLng } } : {};

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools,
      },
      ...(Object.keys(toolConfig).length > 0 && { toolConfig }),
    });
    
    const text = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: GroundingChunk[] = groundingMetadata?.groundingChunks?.map((chunk: GenAIGroundingChunk) => ({
      web: chunk.web,
      maps: chunk.maps
    })) || [];
    
    return { text, sources };

  } catch (error) {
    console.error("Error getting grounded answer:", error);
    return { text: "Nisam uspio pronaći odgovor. Pokušajte ponovno.", sources: [] };
  }
};

export const suggestCategory = async (description: string, categories: readonly string[]): Promise<{ suggestedCategory: string; reason: string } | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analiziraj sljedeći opis prijave i odaberi najprikladniju kategoriju s popisa. Opis: "${description}". Dostupne kategorije: ${categories.join(', ')}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedCategory: {
              type: Type.STRING,
              description: `Jedna od sljedećih vrijednosti: ${categories.join(', ')}`,
            },
            reason: {
              type: Type.STRING,
              description: 'Kratko objašnjenje zašto je ova kategorija najbolja (na hrvatskom).',
            },
          },
          required: ["suggestedCategory", "reason"],
        },
      },
    });
    
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Error suggesting category:", error);
    return null;
  }
};


export const startChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'Ti si ljubazan i uslužan asistent za Prometnu Školu Split. Odgovaraj na pitanja učenika, roditelja i osoblja na hrvatskom jeziku. Budi profesionalan, ali topao i pristupačan, kao pedagog.',
    },
  });
};
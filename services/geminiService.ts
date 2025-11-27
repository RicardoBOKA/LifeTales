import { GoogleGenAI, Type } from "@google/genai";
import { AgentResponse, PipelineConfig } from "../types";
import { PROMPTS } from "../constants";

// Helper to get AI instance (ensures fresh API key usage)
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 1. Speech Agent: Transcribes audio
 */
export const runSpeechAgent = async (audioBase64: string, mimeType: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          },
          {
            text: "Transcribe this audio precisely. Return only the transcription."
          }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Speech Agent Error:", error);
    throw new Error("Failed to transcribe audio.");
  }
};

/**
 * 2. Semantic Agent: Extracts mood and tags
 */
export const runSemanticAgent = async (text: string): Promise<{ mood: string; tags: string[] }> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: PROMPTS.SEMANTIC_ANALYSIS + `"${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return {
      mood: result.mood || "Neutral",
      tags: result.tags || []
    };
  } catch (error) {
    console.error("Semantic Agent Error:", error);
    return { mood: "Reflective", tags: ["Life"] }; // Fallback
  }
};

/**
 * 3. Story Builder Agent: Weaves the narrative
 */
export const runStoryBuilderAgent = async (rawInput: string, config: PipelineConfig): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Flash is sufficient for fast rewriting
      contents: PROMPTS.STORY_BUILDER(config.storyContext, rawInput),
      config: {
        temperature: 0.7 // Slightly creative
      }
    });
    return response.text || rawInput;
  } catch (error) {
    console.error("Story Builder Error:", error);
    return rawInput;
  }
};

/**
 * 4. Visual Agent: Generates an illustration
 */
export const runVisualAgent = async (narrative: string, mood: string): Promise<string | undefined> => {
  try {
    const ai = getAiClient();
    const prompt = PROMPTS.VISUAL_GENERATION(narrative, mood);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using standard image generation model
      contents: prompt,
    });

    // Check for inline data in parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return undefined;
  } catch (error) {
    console.error("Visual Agent Error:", error);
    return undefined; // Fail silently for images, it's decorative
  }
};

/**
 * Orchestrator: Runs the pipeline
 */
export const processMemoryPipeline = async (
  input: { type: 'audio' | 'text', data: string, mimeType?: string },
  config: PipelineConfig,
  onStatusChange: (status: any) => void
): Promise<AgentResponse> => {
  
  let rawText = "";

  // Step 1: Speech Processing (if audio)
  if (input.type === 'audio' && input.mimeType) {
    onStatusChange('TRANSCRIBING');
    rawText = await runSpeechAgent(input.data, input.mimeType);
  } else {
    rawText = input.data;
  }

  // Step 2: Semantic Analysis
  onStatusChange('ANALYZING');
  const semanticData = await runSemanticAgent(rawText);

  // Step 3: Story Building
  onStatusChange('WEAVING');
  const narrative = await runStoryBuilderAgent(rawText, config);

  // Step 4: Visual Generation
  onStatusChange('ILLUSTRATING');
  const illustration = await runVisualAgent(narrative, semanticData.mood);

  return {
    transcription: rawText,
    narrative,
    mood: semanticData.mood,
    tags: semanticData.tags,
    illustration
  };
};

// Helper for converting Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export enum GeminiModel {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-2.5-pro',
}

interface GenerateContentParams {
  model: GeminiModel;
  prompt: string;
  isThinkingMode?: boolean;
}

// Function to safely get the API key
const getApiKey = async (): Promise<string | undefined> => {
  // Assume process.env.API_KEY is available in the environment
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not set. Please ensure it's configured.");
    // In a real app, you might want to open the key selection dialog here.
    // For this context, we assume the environment variable will be correctly injected.
  }
  return apiKey;
};

export const geminiService = {
  generateContent: async ({ model, prompt, isThinkingMode = false }: GenerateContentParams): Promise<string> => {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key is not available.");
    }

    // Create a new GoogleGenAI instance right before making an API call
    // to ensure it always uses the most up-to-date API key.
    const ai = new GoogleGenAI({ apiKey });

    try {
      const config: { thinkingConfig?: { thinkingBudget: number } } = {};
      if (isThinkingMode && model === GeminiModel.PRO) {
        config.thinkingConfig = { thinkingBudget: 32768 }; // Max budget for 2.5-pro
      } else if (isThinkingMode && model === GeminiModel.FLASH) {
        // While thinkingConfig can be used with Flash, max budget is 24576.
        // For simplicity, thinkingMode specifically implies PRO for full reasoning.
        // If a user selects Flash for thinking mode, we'll still apply a budget, but ideally they use PRO.
        console.warn("Thinking mode with Flash model. For complex reasoning, 'Pro' model is recommended.");
        config.thinkingConfig = { thinkingBudget: 24576 };
      }


      const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: { ...config },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Gemini API returned an empty response.");
      }
      return text;
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      if (error.message.includes("Requested entity was not found.")) {
        // This is the specific error for a bad API key selection with Veo models.
        // For other models, it might indicate other issues, but we can still suggest re-selecting.
        console.error("API Key might be invalid or not selected. Please re-select your API key.");
        // If `window.aistudio` is available, prompt user to select key.
        if ((window as any).aistudio && typeof (window as any).aistudio.openSelectKey === 'function') {
          await (window as any).aistudio.openSelectKey();
          // Assume success for now, user will try again.
        }
        throw new Error("API Key issue detected. Please check and re-select your API key. See billing docs: ai.google.dev/gemini-api/docs/billing");
      }
      throw new Error(`Failed to generate content: ${error.message || 'Unknown error'}`);
    }
  },
};
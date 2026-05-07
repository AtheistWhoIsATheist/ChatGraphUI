import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
let clientInitAttempted = false;

export function getGeminiClient(): GoogleGenAI | null {
  if (clientInitAttempted) return aiClient;
  
  clientInitAttempted = true;
  
  // Prefer process.env mapped by Vite config, fallback to VITE_ prefixed var
  const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : undefined;
  const apiKey = (process.env.GEMINI_API_KEY || envKey)?.trim() || "";
  
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured. AI features will be gracefully disabled.");
    return null;
  }
  
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    aiClient = null;
  }
  
  return aiClient;
}

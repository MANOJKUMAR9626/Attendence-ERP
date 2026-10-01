import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.list();
    for (const model of response.models) {
      console.log(model.name, model.supportedGenerationMethods);
    }
  } catch(e) {
    console.error('List models failed:', e.message);
  }
}
listModels();

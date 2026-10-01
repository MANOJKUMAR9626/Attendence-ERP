import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModels() {
  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-3.0-flash',
    'gemini-3.5-flash',
    'gemini-4.0-flash'
  ];

  for (const model of modelsToTest) {
    try {
      console.log(`Testing model: ${model}`);
      const chat = ai.chats.create({ model });
      const result = await chat.sendMessage({ message: 'Hello' });
      console.log(`✅ Success with ${model}: ${result.text.substring(0, 20)}...`);
      return; // Stop on first success
    } catch (e) {
      console.log(`❌ Failed with ${model}: ${e.message}`);
    }
  }
}

testModels();

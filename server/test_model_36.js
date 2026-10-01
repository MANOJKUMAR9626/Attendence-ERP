import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModel() {
  try {
    const chat = ai.chats.create({ model: 'gemini-3.6-flash' });
    const result = await chat.sendMessage({ message: 'Hello' });
    console.log(`✅ Success with gemini-3.6-flash: ${result.text.substring(0, 20)}...`);
  } catch (e) {
    console.log(`❌ Failed with gemini-3.6-flash: ${e.message}`);
  }
}

testModel();

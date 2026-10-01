import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const ai = new GoogleGenAI({});

async function test() {
  try {
    console.log('Testing with key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: { parts: [{ text: "You are a test bot." }] },
      }
    });

    let result = await chat.sendMessage({ message: "Hello" });
    console.log("Success:", result.text);
  } catch (err) {
    console.error("Error calling Gemini API:", err);
  }
}

test();

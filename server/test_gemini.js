import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  console.time('gemini-3.6-flash');
  try {
    await ai.chats.create({model: 'gemini-3.6-flash'}).sendMessage({message: 'hi'});
    console.timeEnd('gemini-3.6-flash');
  } catch(e) { console.error('3.6 failed', e.message); }

  console.time('gemini-1.5-flash');
  try {
    await ai.chats.create({model: 'gemini-1.5-flash'}).sendMessage({message: 'hi'});
    console.timeEnd('gemini-1.5-flash');
  } catch(e) { console.error('1.5 failed', e.message); }
}
test();

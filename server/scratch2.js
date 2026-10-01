import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const ai = new GoogleGenAI({});

async function test() {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      config: {
        tools: [{
            functionDeclarations: [{
                name: 'get_weather',
                description: 'Get weather',
                parameters: { type: 'OBJECT', properties: {} }
            }]
        }]
      }
    });

    let result = await chat.sendMessage({ message: "What is the weather?" });
    
    if (result.functionCalls) {
        console.log("Got function call!");
        const call = result.functionCalls[0];
        
        const responses = [{
            functionResponse: {
                id: call.id,
                name: call.name,
                response: { result: "Sunny" }
            }
        }];
        
        let result2 = await chat.sendMessage({ message: responses });
        console.log("Success:", result2.text);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

test();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { generateResponse } from './src/services/aiChatService.js';

dotenv.config();

async function testFastPaths() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exam_hall_management');
    console.log('Connected to DB');

    const adminUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Admin',
      role: 'admin'
    };

    const questions = [
      "📊 What is today's overall attendance?",
      "👨‍🏫 Which faculty took attendance today?",
      "⚠️ How many students are at risk?",
      "📉 Give me the students below 80% attendance",
      "📧 Give how many parent mail sent for below 80%"
    ];

    for (const q of questions) {
      console.log(`\n\n--- Asking: ${q} ---`);
      const startTime = Date.now();
      const reply = await generateResponse(adminUser, q, []);
      const elapsed = Date.now() - startTime;
      console.log(`Reply (took ${elapsed}ms):`);
      console.log(reply);
    }

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await mongoose.disconnect();
  }
}

testFastPaths();

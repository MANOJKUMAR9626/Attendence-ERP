import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { generateResponse } from './src/services/aiChatService.js';

dotenv.config();

async function testDynamicQuery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exam_hall_management');
    console.log('Connected to DB');

    // Simulate an Admin user
    const adminUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Admin',
      role: 'admin'
    };

    const question = "List the first 2 faculty members in the database";
    console.log(`Asking: ${question}`);
    
    const reply = await generateResponse(adminUser, question, []);
    console.log('\nAI Reply:\n', reply);

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await mongoose.disconnect();
  }
}

testDynamicQuery();

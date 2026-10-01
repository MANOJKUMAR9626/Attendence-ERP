import { generateResponse } from './src/services/aiChatService.js';
import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await connectDB();
  const user = { _id: new mongoose.Types.ObjectId(), name: 'Test', role: 'student' };
  console.time('generateResponse');
  const res = await generateResponse(user, 'hi');
  console.log(res);
  console.timeEnd('generateResponse');
  process.exit(0);
}
test();

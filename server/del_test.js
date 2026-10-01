import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
const Notification = mongoose.model('Notification', new mongoose.Schema({ type: String, createdAt: Date }));
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const res = await Notification.deleteMany({ type: 'Attendance Alert', createdAt: { $gte: startOfToday } });
  console.log('Deleted', res.deletedCount, 'notifications from today so the user can test again.');
  mongoose.disconnect();
}
run();

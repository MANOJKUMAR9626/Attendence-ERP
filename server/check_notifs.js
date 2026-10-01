import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const notificationSchema = new mongoose.Schema({
  recipient: mongoose.Schema.Types.ObjectId,
  type: String,
  title: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', notificationSchema);

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp');
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  const notifs = await Notification.find({ type: 'Attendance Alert', createdAt: { $gte: startOfToday } }).lean();
  console.log("Today's Attendance Alerts:", notifs);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yestNotifs = await Notification.find({ type: 'Attendance Alert', createdAt: { $gte: yesterday, $lt: startOfToday } }).lean();
  console.log("Yesterday's Attendance Alerts:", yestNotifs.length);

  mongoose.disconnect();
}
check();

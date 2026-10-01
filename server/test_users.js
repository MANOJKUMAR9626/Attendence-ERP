import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
});
const User = mongoose.model('User', userSchema);

const notificationSchema = new mongoose.Schema({
  recipient: mongoose.Schema.Types.ObjectId,
  type: String,
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', notificationSchema);

async function checkUsers() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_erp');
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  const notifs = await Notification.find({ type: 'Attendance Alert', createdAt: { $gte: startOfToday } }).lean();
  console.log("Found", notifs.length, "notifications today.");
  
  for (const notif of notifs) {
    const user = await User.findById(notif.recipient).lean();
    if (user) {
      console.log(`Notification sent to: ${user.name} (Role: ${user.role}, Email: ${user.email})`);
    }
  }

  mongoose.disconnect();
}
checkUsers();

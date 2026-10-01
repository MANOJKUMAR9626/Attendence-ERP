const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/attendance_erp').then(async () => {
  const Notification = mongoose.model('Notification', new mongoose.Schema({}, {strict: false}), 'notifications');
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}), 'users');
  
  const parentUser = await User.findOne({ email: 'manojmahi9626@gmail.com' });
  if (!parentUser) return console.log('Parent user not found');
  
  const startOfToday = new Date(); 
  startOfToday.setHours(0,0,0,0);
  
  const alerts = await Notification.find({ 
    recipient: parentUser._id, 
    type: 'Attendance Alert', 
    createdAt: { $gte: startOfToday }
  });
  
  console.log('Alerts found today for parent:', alerts.length);
  
  if (alerts.length > 0) {
    console.log('Deleting today\'s alerts so email can trigger again...');
    await Notification.deleteMany({
      recipient: parentUser._id,
      type: 'Attendance Alert',
      createdAt: { $gte: startOfToday }
    });
    console.log('Deleted. Ready to test email again.');
  }
  
  process.exit(0);
}).catch(console.error);

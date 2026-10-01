const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/attendance_erp').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}), 'users');
  const Faculty = mongoose.model('Faculty', new mongoose.Schema({}, {strict: false}), 'faculties');
  
  const faculties = await Faculty.find({});
  const userIds = faculties.map(f => f.user);
  
  const result = await User.updateMany({ _id: { $in: userIds } }, { $set: { phone: '1234567890' } });
  
  console.log('Updated ' + result.modifiedCount + ' faculty phone numbers.');
  process.exit(0);
});

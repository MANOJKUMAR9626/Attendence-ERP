const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/attendance_erp').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}), 'users');
  const dummyDomains = ['@erp.com', '@test.com', '@example.com', '@dummy.com'];
  const users = await User.find({ role: 'parent' });
  let count = 0;
  
  for(const u of users) {
    if (dummyDomains.some(d => u.email.toLowerCase().endsWith(d))) {
      // Use the gmail plus addressing feature so it sends to manojmahi9626 but is unique
      const newEmail = 'manojmahi9626+' + (u.identifier ? u.identifier.toLowerCase() : 'parent' + count) + '@gmail.com';
      await User.updateOne({_id: u._id}, {$set: {email: newEmail}});
      count++;
    }
  }
  
  console.log(`Updated ${count} dummy parent emails to prevent bounces.`);
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/attendance_erp').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}), 'users');
  const users = await User.find({ role: 'parent' });
  let count = 0;
  
  for(const u of users) {
    // If it's Manoj's parent, leave it alone!
    if (u.email === 'manojmahi9626@gmail.com') {
        continue;
    }
    
    // For all other parents, set them to a @dummy.com address.
    // The system (sendEmail.js) will recognize @dummy.com and SKIP sending the email.
    // This prevents both spam to your inbox AND prevents bounce messages!
    const newEmail = (u.identifier ? u.identifier.toLowerCase() : 'parent' + count) + '@dummy.com';
    await User.updateOne({_id: u._id}, {$set: {email: newEmail}});
    count++;
  }
  
  console.log(`Updated ${count} other parent emails to @dummy.com to stop the spam.`);
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});

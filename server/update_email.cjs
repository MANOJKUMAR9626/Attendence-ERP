const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/attendance_erp').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}), 'users');
  const Student = mongoose.model('Student', new mongoose.Schema({}, {strict: false}), 'students');
  const Parent = mongoose.model('Parent', new mongoose.Schema({}, {strict: false}), 'parents');
  
  // Find the student named "Nisha"
  const nishaUser = await User.findOne({ name: /Nisha/i, role: 'student' });
  
  if (!nishaUser) {
    console.log('Nisha not found in Users');
    process.exit(1);
  }
  
  // Find the student record
  const student = await Student.findOne({ user: nishaUser._id });
  if (!student) {
    console.log('Nisha student record not found');
    process.exit(1);
  }
  
  // Find the parent record linked to this student
  const parent = await Parent.findOne({ students: student._id });
  if (!parent) {
    console.log('Parent of Nisha not found');
    process.exit(1);
  }
  
  // Update the Parent's User record to an unused dummy email
  const updatedUser = await User.findByIdAndUpdate(
    parent.user,
    { $set: { email: 'nisha_parent@erp.com' } },
    { new: true }
  );
  
  console.log('Successfully updated Parent of Nisha to email:', updatedUser.email);
  process.exit(0);
}).catch(console.error);

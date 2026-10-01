import sendEmail from './src/utils/sendEmail.js';
import dotenv from 'dotenv';
dotenv.config();

async function testMail() {
  try {
    await sendEmail({
      email: 'manojmahi9626@gmail.com', // Sending to self for test
      subject: 'Test Mail',
      message: 'This is a test mail',
      html: '<p>Test</p>'
    });
    console.log("Mail sent successfully!");
  } catch (err) {
    console.error("Mail failed:", err);
  }
}

testMail();

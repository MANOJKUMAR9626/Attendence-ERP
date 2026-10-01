import dotenv from "dotenv";
dotenv.config();

import twilio from "twilio";

async function testSMS() {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      to: "+919626134200",
      from: process.env.TWILIO_PHONE_NUMBER,
      body: "sms_appointment_reminders"
    });

    console.log("✅ SMS sent successfully!");
    console.log("Message SID:", message.sid);

  } catch (error) {
    console.error("❌ Twilio Error:", error.message);
  }
}

testSMS();

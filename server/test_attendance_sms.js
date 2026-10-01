import dotenv from "dotenv";
dotenv.config();

import sendSMS from "./src/utils/sendSMS.js";

async function test() {
  const result = await sendSMS(
    "+919626134200",
    "Manoj",
    40
  );

  console.log(result);
}

test();

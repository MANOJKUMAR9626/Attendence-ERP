const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", err => console.log("PAGE ERROR:", err.message));
  try {
    await page.goto("http://localhost:5173/login");
    await page.type("#email", "fac001@erp.com");
    await page.type("#password", "password123");
    await page.click("button[type=submit]");
    await page.waitForNavigation();
    console.log("Navigated to:", page.url());
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.error("TEST SCRIPT ERROR:", e);
  } finally {
    await browser.close();
  }
})();

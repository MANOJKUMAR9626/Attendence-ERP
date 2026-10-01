const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:5173/login');
  
  // Clear the existing text
  await page.evaluate(() => document.querySelector('#email').value = '');
  await page.type('#email', 'fac001@erp.com');
  
  await page.evaluate(() => document.querySelector('#password').value = '');
  await page.type('#password', 'password123');
  
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();

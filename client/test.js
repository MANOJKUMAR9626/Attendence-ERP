const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173/login');
  await page.type('input[type="email"]', 'faculty@smarterp.edu');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({waitUntil: 'networkidle0'}).catch(() => {});
  
  console.log('Navigating to faculty dashboard...');
  await page.goto('http://localhost:5173/faculty', {waitUntil: 'networkidle0'});
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();

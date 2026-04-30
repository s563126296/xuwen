import { chromium } from 'playwright';

const browser = await chromium.launch({ 
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
});

const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

const consoleLogs = [];
page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));

try {
  await page.goto('http://127.0.0.1:5181', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);
  
  // Switch to port mode
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent?.trim() === '港口');
    if (btn) btn.click();
  });
  await page.waitForTimeout(5000);
  
  const errors = consoleLogs.filter(l => l.type === 'error');
  const has403 = consoleLogs.some(l => l.text.includes('403') || l.text.includes('Failed to load'));
  
  console.log(`Console errors: ${errors.length}`);
  console.log(`403 errors: ${has403 ? 'YES' : 'NO'}`);
  
  if (errors.length > 0) {
    errors.forEach(e => console.log(`  [ERROR] ${e.text}`));
  }
  
  console.log(has403 ? '\n❌ 403 error still present' : '\n✅ 403 error fixed!');
  
} catch(e) {
  console.error('Error:', e.message);
}

await browser.close();

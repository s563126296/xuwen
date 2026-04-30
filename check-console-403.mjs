import { chromium } from 'playwright';

const browser = await chromium.launch({ 
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
});

const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

const consoleLogs = [];
page.on('console', msg => {
  const text = msg.text();
  consoleLogs.push({ type: msg.type(), text });
  
  // Log 403 related messages immediately
  if (text.includes('403') || text.includes('Failed to load')) {
    console.log(`\n🔴 CONSOLE [${msg.type()}]: ${text}`);
  }
});

console.log('=== Monitoring Console for 403 Errors ===\n');

try {
  await page.goto('http://127.0.0.1:5181', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);
  
  console.log('--- Switching to Port Mode ---');
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const btn = buttons.find(b => b.textContent?.trim() === '港口');
    if (btn) btn.click();
  });
  
  await page.waitForTimeout(5000);
  
  console.log('\n--- Checking All Console Logs ---');
  const errors = consoleLogs.filter(l => l.type === 'error');
  const warnings = consoleLogs.filter(l => l.type === 'warning');
  
  console.log(`\nTotal console logs: ${consoleLogs.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  
  if (errors.length > 0) {
    console.log('\n=== All Console Errors ===');
    errors.forEach((e, idx) => {
      console.log(`\n#${idx + 1}: ${e.text}`);
    });
  }
  
  // Check for 403 in any log
  const has403 = consoleLogs.some(l => l.text.includes('403') || l.text.includes('Failed to load'));
  console.log(`\n403 found in console: ${has403 ? 'YES' : 'NO'}`);
  
} catch(e) {
  console.error('Error:', e.message);
}

await browser.close();

import { chromium } from 'playwright';

const browser = await chromium.launch({ 
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
});

const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

const consoleLogs = [];
page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));

console.log('=== Testing Mode Switching ===\n');

try {
  await page.goto('http://127.0.0.1:5181', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(10000);
  
  // Get initial page text
  const initialText = await page.evaluate(() => document.body.innerText);
  console.log(`Initial page text length: ${initialText.length}`);
  
  const modes = ['港口', '指挥', '统计分析', 'AI策略', '总览'];
  const results = {};
  
  for (const mode of modes) {
    console.log(`\n--- Testing mode: ${mode} ---`);
    consoleLogs.length = 0; // Clear logs
    
    // Use JS click to bypass actionability checks
    const clicked = await page.evaluate((modeName) => {
      const buttons = [...document.querySelectorAll('button')];
      const btn = buttons.find(b => b.textContent?.trim() === modeName);
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    }, mode);
    
    if (!clicked) {
      console.log(`❌ Button "${mode}" not found`);
      results[mode] = { status: 'FAIL', reason: 'Button not found' };
      continue;
    }
    
    console.log(`✓ Clicked "${mode}" button via JS`);
    await page.waitForTimeout(3000);
    
    // Check page content
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log(`✓ Page text length: ${pageText.length}`);
    console.log(`✓ First 300 chars: ${pageText.substring(0, 300).replace(/\n/g, ' | ')}`);
    
    // Check for new errors
    const newErrors = consoleLogs.filter(l => l.type === 'error');
    if (newErrors.length > 0) {
      console.log(`⚠️ Console errors after switching to ${mode}:`);
      newErrors.forEach(e => console.log(`  [ERROR] ${e.text}`));
      results[mode] = { status: 'WARN', errors: newErrors.length, textLength: pageText.length };
    } else {
      console.log(`✓ No console errors`);
      results[mode] = { status: 'PASS', textLength: pageText.length };
    }
  }
  
  console.log('\n\n=== Mode Switching Summary ===');
  for (const [mode, result] of Object.entries(results)) {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${icon} ${mode}: ${result.status} (text: ${result.textLength} chars${result.errors ? `, errors: ${result.errors}` : ''})`);
  }
  
} catch(e) {
  console.error('Error:', e.message);
}

await browser.close();

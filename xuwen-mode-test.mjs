import { chromium } from 'playwright';

const browser = await chromium.launch({ 
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
});

const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

// Collect console errors per mode
const allConsoleLogs = [];
page.on('console', msg => allConsoleLogs.push({ type: msg.type(), text: msg.text(), ts: Date.now() }));

console.log('=== Testing Mode Switching ===\n');

try {
  await page.goto('http://127.0.0.1:5181', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);
  
  const modes = ['港口', '指挥', '统计分析', 'AI策略', '总览'];
  
  for (const mode of modes) {
    console.log(`\n--- Testing mode: ${mode} ---`);
    const errorsBefore = allConsoleLogs.filter(l => l.type === 'error').length;
    
    // Use JS click to bypass actionability checks
    const clicked = await page.evaluate((modeText) => {
      const buttons = [...document.querySelectorAll('button')];
      const btn = buttons.find(b => b.textContent?.trim() === modeText);
      if (btn) { btn.click(); return true; }
      return false;
    }, mode);
    
    if (!clicked) {
      console.log(`  ❌ Button "${mode}" not found`);
      continue;
    }
    console.log(`  ✓ Clicked "${mode}"`);
    
    await page.waitForTimeout(3000);
    
    // Check page content
    const pageText = await page.evaluate(() => document.body?.innerText || '');
    console.log(`  ✓ Content length: ${pageText.length} chars`);
    console.log(`  ✓ First 200 chars: ${pageText.substring(0, 200).replace(/\n/g, ' | ')}`);
    
    // Check for new errors
    const errorsAfter = allConsoleLogs.filter(l => l.type === 'error').length;
    const newErrors = errorsAfter - errorsBefore;
    if (newErrors > 0) {
      console.log(`  ⚠️ ${newErrors} new console errors after switching`);
      allConsoleLogs.filter(l => l.type === 'error').slice(-newErrors).forEach(e => console.log(`    [ERROR] ${e.text}`));
    } else {
      console.log(`  ✓ No new console errors`);
    }
    
    // Check for visible error states in UI
    const errorStates = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], .error-boundary');
      return [...errorElements].map(e => e.textContent?.trim()).filter(Boolean).slice(0, 5);
    });
    if (errorStates.length > 0) {
      console.log(`  ⚠️ Error states in UI: ${JSON.stringify(errorStates)}`);
    }
  }
  
  // Final summary
  console.log('\n\n=== Final Console Log Summary ===');
  const errors = allConsoleLogs.filter(l => l.type === 'error');
  const warnings = allConsoleLogs.filter(l => l.type === 'warning');
  console.log(`Total errors: ${errors.length}`);
  console.log(`Total warnings: ${warnings.length}`);
  if (errors.length > 0) {
    console.log('\nAll errors:');
    errors.forEach(e => console.log(`  [ERROR] ${e.text}`));
  }
  if (warnings.length > 0) {
    console.log('\nAll warnings (unique):');
    const uniqueWarnings = [...new Set(warnings.map(w => w.text))];
    uniqueWarnings.forEach(w => console.log(`  [WARN] ${w}`));
  }
  
} catch(e) {
  console.error('Error:', e.message);
}

await browser.close();

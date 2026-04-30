import { chromium } from 'playwright';

const browser = await chromium.launch({ 
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
});

const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

const allResponses = [];
const error403s = [];

page.on('response', resp => {
  const data = {
    url: resp.url(),
    status: resp.status(),
    statusText: resp.statusText(),
    contentType: resp.headers()['content-type'] || 'unknown'
  };
  allResponses.push(data);
  
  if (resp.status === 403) {
    error403s.push(data);
    console.log(`\n🔴 403 DETECTED: ${resp.url()}`);
  }
});

const failedRequests = [];
page.on('requestfailed', req => {
  const data = {
    url: req.url(),
    method: req.method(),
    resourceType: req.resourceType(),
    failure: req.failure()?.errorText
  };
  failedRequests.push(data);
  console.log(`\n❌ REQUEST FAILED: ${req.url()} - ${data.failure}`);
});

console.log('=== Full Page Load + Port Mode Test ===\n');

try {
  console.log('Loading page...');
  await page.goto('http://127.0.0.1:5181', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(10000);
  
  console.log('\n--- Initial Load Complete ---');
  console.log(`Total responses: ${allResponses.length}`);
  console.log(`403 errors so far: ${error403s.length}`);
  console.log(`Failed requests so far: ${failedRequests.length}`);
  
  // Now switch to port mode
  console.log('\n--- Switching to Port Mode ---');
  const clicked = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const btn = buttons.find(b => b.textContent?.trim() === '港口');
    if (btn) { btn.click(); return true; }
    return false;
  });
  
  if (clicked) {
    console.log('✓ Clicked port mode button');
    await page.waitForTimeout(5000);
  }
  
  console.log('\n--- After Port Mode Switch ---');
  console.log(`Total responses: ${allResponses.length}`);
  console.log(`403 errors total: ${error403s.length}`);
  console.log(`Failed requests total: ${failedRequests.length}`);
  
  // Report all 403s
  if (error403s.length > 0) {
    console.log('\n\n=== ALL 403 ERRORS ===\n');
    error403s.forEach((err, idx) => {
      console.log(`\n#${idx + 1}: ${err.url}`);
      console.log(`  Status: ${err.status} ${err.statusText}`);
      console.log(`  Content-Type: ${err.contentType}`);
    });
  } else {
    console.log('\n✅ No 403 errors detected');
  }
  
  // Report all failed requests
  if (failedRequests.length > 0) {
    console.log('\n\n=== ALL FAILED REQUESTS ===\n');
    failedRequests.forEach((req, idx) => {
      console.log(`\n#${idx + 1}: ${req.url}`);
      console.log(`  Method: ${req.method}`);
      console.log(`  Type: ${req.resourceType}`);
      console.log(`  Failure: ${req.failure}`);
    });
  } else {
    console.log('\n✅ No failed requests');
  }
  
  // Show all 4xx/5xx
  const allErrors = allResponses.filter(r => r.status >= 400);
  if (allErrors.length > 0) {
    console.log('\n\n=== ALL 4xx/5xx RESPONSES ===\n');
    allErrors.forEach((err, idx) => {
      console.log(`\n#${idx + 1}: [${err.status}] ${err.url}`);
    });
  }
  
} catch(e) {
  console.error('Error:', e.message);
}

await browser.close();

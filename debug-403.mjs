import { chromium } from 'playwright';

const browser = await chromium.launch({ 
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
});

const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

// Capture all network requests
const allRequests = [];
page.on('request', req => {
  allRequests.push({
    url: req.url(),
    method: req.method(),
    resourceType: req.resourceType(),
    headers: req.headers()
  });
});

const allResponses = [];
page.on('response', resp => {
  allResponses.push({
    url: resp.url(),
    status: resp.status(),
    statusText: resp.statusText(),
    headers: resp.headers()
  });
});

const failedRequests = [];
page.on('requestfailed', req => {
  failedRequests.push({
    url: req.url(),
    method: req.method(),
    resourceType: req.resourceType(),
    failure: req.failure()
  });
});

console.log('=== Debugging 403 Error in Port Mode ===\n');

try {
  await page.goto('http://127.0.0.1:5181', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);
  
  console.log('Initial page loaded. Clearing request logs...\n');
  
  // Clear logs before switching to port mode
  allRequests.length = 0;
  allResponses.length = 0;
  failedRequests.length = 0;
  
  console.log('--- Switching to Port Mode ---');
  
  // Click port mode button
  const clicked = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const btn = buttons.find(b => b.textContent?.trim() === '港口');
    if (btn) { btn.click(); return true; }
    return false;
  });
  
  if (!clicked) {
    console.log('❌ Port mode button not found');
    await browser.close();
    process.exit(1);
  }
  
  console.log('✓ Clicked port mode button');
  
  // Wait for requests to complete
  await page.waitForTimeout(5000);
  
  console.log('\n=== Network Requests After Switching to Port Mode ===\n');
  
  // Find 403 responses
  const error403s = allResponses.filter(r => r.status === 403);
  
  if (error403s.length === 0) {
    console.log('No 403 errors found. Checking all failed requests...\n');
    
    if (failedRequests.length > 0) {
      console.log('Failed requests:');
      failedRequests.forEach(req => {
        console.log(`\n[FAILED] ${req.method} ${req.url}`);
        console.log(`  Type: ${req.resourceType}`);
        console.log(`  Failure: ${JSON.stringify(req.failure)}`);
      });
    } else {
      console.log('No failed requests found.');
    }
    
    // Show all 4xx/5xx responses
    const errorResponses = allResponses.filter(r => r.status >= 400);
    if (errorResponses.length > 0) {
      console.log('\nAll 4xx/5xx responses:');
      errorResponses.forEach(resp => {
        console.log(`\n[${resp.status}] ${resp.url}`);
        console.log(`  Status: ${resp.statusText}`);
      });
    }
  } else {
    console.log(`Found ${error403s.length} 403 error(s):\n`);
    
    error403s.forEach((resp, idx) => {
      console.log(`\n=== 403 Error #${idx + 1} ===`);
      console.log(`URL: ${resp.url}`);
      console.log(`Status: ${resp.status} ${resp.statusText}`);
      console.log(`Headers:`);
      Object.entries(resp.headers).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      
      // Find corresponding request
      const req = allRequests.find(r => r.url === resp.url);
      if (req) {
        console.log(`\nRequest details:`);
        console.log(`  Method: ${req.method}`);
        console.log(`  Type: ${req.resourceType}`);
        console.log(`  Request headers:`);
        Object.entries(req.headers).forEach(([key, value]) => {
          console.log(`    ${key}: ${value}`);
        });
      }
    });
  }
  
  // Show all requests made after switching
  console.log(`\n\n=== All Requests After Port Mode Switch (${allRequests.length} total) ===\n`);
  allRequests.slice(0, 30).forEach((req, idx) => {
    const resp = allResponses.find(r => r.url === req.url);
    const status = resp ? resp.status : 'pending';
    const statusIcon = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✓';
    console.log(`${statusIcon} [${status}] ${req.method} ${req.resourceType} ${req.url.substring(0, 100)}`);
  });
  
  if (allRequests.length > 30) {
    console.log(`\n... and ${allRequests.length - 30} more requests`);
  }
  
} catch(e) {
  console.error('Error:', e.message);
}

await browser.close();

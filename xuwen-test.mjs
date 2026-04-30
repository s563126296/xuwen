import { chromium } from 'playwright';

const browser = await chromium.launch({ 
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
});

const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

const consoleLogs = [];
page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));

const networkErrors = [];
page.on('requestfailed', req => networkErrors.push({ url: req.url(), error: req.failure()?.errorText }));

const networkRequests = [];
page.on('response', resp => {
  networkRequests.push({ url: resp.url(), status: resp.status() });
});

console.log('=== Navigating to page ===');
try {
  await page.goto('http://127.0.0.1:5181', { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('Page loaded');
  await page.waitForTimeout(10000);

  const title = await page.title();
  console.log('Title:', title);

  // Screenshot with longer timeout
  try {
    await page.screenshot({ path: '/Users/zhangmingchen/xuwen/xuwen-overview.png', fullPage: false, timeout: 60000, animations: 'disabled' });
    console.log('Screenshot saved');
  } catch(e) {
    console.log('Screenshot failed:', e.message.split('\n')[0]);
  }

  // Get page text
  const bodyText = await page.evaluate(() => document.body?.innerText || 'EMPTY');
  console.log('\n=== Page Text (first 1000 chars) ===');
  console.log(bodyText.substring(0, 1000));

  // Check for visible elements
  const elements = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')].map(b => b.textContent?.trim()).filter(Boolean);
    const links = [...document.querySelectorAll('a')].map(a => ({ text: a.textContent?.trim(), href: a.href })).filter(a => a.text);
    const inputs = [...document.querySelectorAll('input, textarea')].map(i => ({ type: i.type, placeholder: i.placeholder }));
    const modeTabs = [...document.querySelectorAll('[class*="mode"], [class*="tab"], [class*="nav"]')].map(e => e.textContent?.trim()).filter(Boolean);
    return { buttons: buttons.slice(0, 20), links: links.slice(0, 10), inputs, modeTabs: modeTabs.slice(0, 10) };
  });
  console.log('\n=== Interactive Elements ===');
  console.log('Buttons:', JSON.stringify(elements.buttons));
  console.log('Links:', JSON.stringify(elements.links));
  console.log('Inputs:', JSON.stringify(elements.inputs));
  console.log('Mode tabs:', JSON.stringify(elements.modeTabs));

  // Console logs
  console.log('\n=== Console Errors ===');
  const errors = consoleLogs.filter(l => l.type === 'error');
  if (errors.length === 0) console.log('No console errors');
  else errors.forEach(l => console.log(`[ERROR] ${l.text}`));

  console.log('\n=== Console Warnings ===');
  const warnings = consoleLogs.filter(l => l.type === 'warning');
  if (warnings.length === 0) console.log('No console warnings');
  else warnings.slice(0, 20).forEach(l => console.log(`[WARN] ${l.text}`));

  // Network errors
  console.log('\n=== Network Errors ===');
  if (networkErrors.length === 0) console.log('No network errors');
  else networkErrors.forEach(e => console.log(`FAILED: ${e.url} - ${e.error}`));

  console.log('\n=== Failed HTTP Responses ===');
  const failedReqs = networkRequests.filter(r => r.status >= 400);
  if (failedReqs.length === 0) console.log('No failed HTTP responses');
  else failedReqs.forEach(r => console.log(`${r.status}: ${r.url}`));

  console.log('\n=== Summary ===');
  console.log(`Total requests: ${networkRequests.length}, Failed: ${networkErrors.length + failedReqs.length}, Console errors: ${errors.length}, Warnings: ${warnings.length}`);

} catch(e) {
  console.error('Error:', e.message);
}

await browser.close();

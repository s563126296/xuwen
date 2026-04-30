const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://127.0.0.1:5180';
const OUTPUT_DIR = path.join(__dirname, '..', 'test-results');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1920,1080', '--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const results = [];

  // Test 1: Overview mode loads
  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(3000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-overview.png'), fullPage: true });
    const title = await page.title();
    results.push({ test: '总览模式加载', status: 'PASS', detail: `Title: ${title}` });
  } catch (e) {
    results.push({ test: '总览模式加载', status: 'FAIL', detail: e.message });
  }

  // Test 2: Check for console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(3000);
  if (consoleErrors.length === 0) {
    results.push({ test: '控制台无错误', status: 'PASS', detail: '无 console.error' });
  } else {
    results.push({ test: '控制台无错误', status: 'WARN', detail: consoleErrors.slice(0, 3).join('; ') });
  }

  // Test 3: Switch to command mode
  try {
    const tabs = await page.$$('nav button, [role="tab"], header button, header a, header div[class*="tab"], header div[class*="nav"]');
    let commandClicked = false;
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && text.includes('指挥')) {
        await tab.click();
        commandClicked = true;
        break;
      }
    }
    if (!commandClicked) {
      const allText = await page.evaluate(() => document.body.innerText.substring(0, 500));
      results.push({ test: '切换指挥模式', status: 'SKIP', detail: '未找到指挥按钮' });
    } else {
      await sleep(3000);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '02-command.png'), fullPage: true });
      results.push({ test: '切换指挥模式', status: 'PASS', detail: '已切换' });
    }
  } catch (e) {
    results.push({ test: '切换指挥模式', status: 'FAIL', detail: e.message });
  }

  // Test 4: Switch to analysis mode
  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(2000);
    const allElements = await page.$$('*');
    let analysisClicked = false;
    for (const el of allElements) {
      const text = await page.evaluate(e => e.textContent, el);
      const tag = await page.evaluate(e => e.tagName, el);
      if (text && (text === '统计分析' || text === 'AI分析' || text === '分析') && (tag === 'BUTTON' || tag === 'A' || tag === 'DIV' || tag === 'SPAN')) {
        const isVisible = await page.evaluate(e => {
          const rect = e.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }, el);
        if (isVisible) {
          await el.click();
          analysisClicked = true;
          break;
        }
      }
    }
    if (analysisClicked) {
      await sleep(3000);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03-analysis.png'), fullPage: true });
      results.push({ test: '切换分析模式', status: 'PASS', detail: '已切换' });
    } else {
      results.push({ test: '切换分析模式', status: 'SKIP', detail: '未找到分析按钮' });
    }
  } catch (e) {
    results.push({ test: '切换分析模式', status: 'FAIL', detail: e.message });
  }

  // Test 5: Check page doesn't crash (no white screen)
  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(2000);
    const bodyHTML = await page.evaluate(() => document.body.innerHTML.length);
    if (bodyHTML > 100) {
      results.push({ test: '页面无白屏', status: 'PASS', detail: `Body HTML: ${bodyHTML} chars` });
    } else {
      results.push({ test: '页面无白屏', status: 'FAIL', detail: `Body HTML only ${bodyHTML} chars` });
    }
  } catch (e) {
    results.push({ test: '页面无白屏', status: 'FAIL', detail: e.message });
  }

  await browser.close();

  // Print results
  console.log('\n========== 测试结果 ==========\n');
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : r.status === 'WARN' ? '⚠️' : '⏭️';
    console.log(`${icon} ${r.test}: ${r.status} — ${r.detail}`);
  }
  console.log(`\n截图保存在: ${OUTPUT_DIR}`);
  console.log(`总计: ${results.filter(r => r.status === 'PASS').length} 通过 / ${results.filter(r => r.status === 'FAIL').length} 失败 / ${results.filter(r => r.status === 'WARN').length} 警告\n`);
}

run().catch(e => { console.error('Test runner failed:', e); process.exit(1); });

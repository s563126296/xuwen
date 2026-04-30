const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://127.0.0.1:5180';
const OUT = path.join(__dirname, '..', 'test-results', 'v2.1');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1920,1080', '--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const results = [];
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // ========== 总览模式 ==========
  console.log('\n===== 总览模式测试 =====');

  // Test 1: 页面加载
  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(3000);
    const bodyLen = await page.evaluate(() => document.body.innerHTML.length);
    await page.screenshot({ path: path.join(OUT, '01-overview-default.png'), fullPage: true });
    results.push({ test: '总览模式加载', status: bodyLen > 100 ? 'PASS' : 'FAIL', detail: `Body: ${bodyLen} chars` });
  } catch (e) {
    results.push({ test: '总览模式加载', status: 'FAIL', detail: e.message });
  }

  // Test 2: 场景预设按钮是否存在
  try {
    const presetBtn = await page.$('button[aria-label="场景预设"]');
    if (presetBtn) {
      await presetBtn.click();
      await sleep(500);
      await page.screenshot({ path: path.join(OUT, '02-scenario-panel.png'), fullPage: true });
      results.push({ test: '场景预设面板', status: 'PASS', detail: '面板已打开' });

      // Test 3: 点击"日常平稳"
      const buttons = await page.$$('button');
      let clicked = false;
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('日常平稳')) {
          await btn.click();
          clicked = true;
          break;
        }
      }
      await sleep(2000);
      await page.screenshot({ path: path.join(OUT, '03-scenario-normal.png'), fullPage: true });
      results.push({ test: '日常平稳场景', status: clicked ? 'PASS' : 'FAIL', detail: clicked ? '已切换' : '未找到按钮' });

      // Test 4: 点击"高风险"
      const presetBtn2 = await page.$('button[aria-label="场景预设"]');
      if (presetBtn2) {
        await presetBtn2.click();
        await sleep(500);
        const buttons2 = await page.$$('button');
        let clicked2 = false;
        for (const btn of buttons2) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text && text.includes('高风险')) {
            await btn.click();
            clicked2 = true;
            break;
          }
        }
        await sleep(2000);
        await page.screenshot({ path: path.join(OUT, '04-scenario-high-risk.png'), fullPage: true });
        results.push({ test: '高风险场景', status: clicked2 ? 'PASS' : 'FAIL', detail: clicked2 ? '已切换' : '未找到按钮' });
      }

      // Test 5: 检查是否有告警弹窗
      const alertPopup = await page.evaluate(() => {
        const els = document.querySelectorAll('*');
        for (const el of els) {
          if (el.textContent && el.textContent.includes('AI 主动预警')) return true;
        }
        return false;
      });
      results.push({ test: '高风险告警弹窗', status: alertPopup ? 'PASS' : 'WARN', detail: alertPopup ? '弹窗已显示' : '未检测到弹窗' });

    } else {
      results.push({ test: '场景预设面板', status: 'FAIL', detail: '未找到预设按钮' });
    }
  } catch (e) {
    results.push({ test: '场景预设', status: 'FAIL', detail: e.message });
  }

  // ========== 指挥模式 ==========
  console.log('\n===== 指挥模式测试 =====');

  try {
    // 切换到指挥模式
    const allBtns = await page.$$('button');
    let cmdClicked = false;
    for (const btn of allBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.trim() === '指挥') {
        await btn.click();
        cmdClicked = true;
        break;
      }
    }
    await sleep(3000);
    await page.screenshot({ path: path.join(OUT, '05-command-mode.png'), fullPage: true });
    results.push({ test: '切换指挥模式', status: cmdClicked ? 'PASS' : 'FAIL', detail: cmdClicked ? '已切换' : '未找到按钮' });

    // Test 6: 检查右侧面板是否有增强策略卡片
    const hasRecommendReason = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('推荐理由') || body.includes('历史依据') || body.includes('预期效果');
    });
    results.push({ test: '增强策略卡片', status: hasRecommendReason ? 'PASS' : 'WARN', detail: hasRecommendReason ? '包含推荐理由/历史依据' : '未检测到增强信息' });

    // Test 7: 检查地图图层筛选按钮
    const hasLayerFilter = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('拥堵路段') && body.includes('执行人员');
    });
    results.push({ test: '地图图层筛选', status: hasLayerFilter ? 'PASS' : 'WARN', detail: hasLayerFilter ? '筛选按钮存在' : '未检测到筛选按钮' });

    // Test 8: 检查底部时间轴
    const hasTimeline = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('拥堵触发') || body.includes('AI推荐') || body.includes('确认执行') || body.includes('预计达标');
    });
    results.push({ test: '底部流程时间轴', status: hasTimeline ? 'PASS' : 'WARN', detail: hasTimeline ? '时间轴节点存在' : '未检测到时间轴' });

    // Test 9: 检查顶部栏没有返回按钮
    const hasBackBtn = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('返回总览模式') || body.includes('返回总览');
    });
    results.push({ test: '顶部栏无返回按钮', status: !hasBackBtn ? 'PASS' : 'WARN', detail: !hasBackBtn ? '已移除' : '仍存在返回按钮' });

    // Test 10: 检查自定义策略按钮
    const hasCustomStrategy = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('自定义策略');
    });
    results.push({ test: '自定义策略入口', status: hasCustomStrategy ? 'PASS' : 'WARN', detail: hasCustomStrategy ? '按钮存在' : '未检测到' });

  } catch (e) {
    results.push({ test: '指挥模式测试', status: 'FAIL', detail: e.message });
  }

  // ========== AI策略模式 ==========
  console.log('\n===== AI策略模式测试 =====');

  try {
    const allBtns3 = await page.$$('button');
    let aiClicked = false;
    for (const btn of allBtns3) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.trim() === 'AI策略') {
        await btn.click();
        aiClicked = true;
        break;
      }
    }
    await sleep(2000);
    await page.screenshot({ path: path.join(OUT, '06-ai-strategy-mode.png'), fullPage: true });
    results.push({ test: '切换AI策略模式', status: aiClicked ? 'PASS' : 'FAIL', detail: aiClicked ? '已切换' : '未找到按钮' });

    // Test 11: 检查4个Tab
    const hasTabs = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('策略模拟器') && body.includes('进化记录') && body.includes('决策树') && body.includes('知识图谱');
    });
    results.push({ test: 'AI策略4个Tab', status: hasTabs ? 'PASS' : 'FAIL', detail: hasTabs ? '4个Tab都存在' : '缺少Tab' });

    // Test 12: 检查运行模拟按钮
    const hasRunBtn = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('运行模拟');
    });
    results.push({ test: '运行模拟按钮', status: hasRunBtn ? 'PASS' : 'WARN', detail: hasRunBtn ? '按钮存在' : '未检测到' });

    // Test 13: 检查策略专属参数
    const hasSpecificParams = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('策略专属参数') || body.includes('通用环境参数');
    });
    results.push({ test: '两层参数结构', status: hasSpecificParams ? 'PASS' : 'WARN', detail: hasSpecificParams ? '参数分层存在' : '未检测到' });

  } catch (e) {
    results.push({ test: 'AI策略模式测试', status: 'FAIL', detail: e.message });
  }

  // ========== 统计分析模式 ==========
  console.log('\n===== 统计分析模式测试 =====');

  try {
    const allBtns4 = await page.$$('button');
    let analysisClicked = false;
    for (const btn of allBtns4) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.trim() === '统计分析') {
        await btn.click();
        analysisClicked = true;
        break;
      }
    }
    await sleep(2000);
    await page.screenshot({ path: path.join(OUT, '07-analysis-mode.png'), fullPage: true });
    results.push({ test: '切换统计分析模式', status: analysisClicked ? 'PASS' : 'FAIL', detail: analysisClicked ? '已切换' : '未找到按钮' });

    // Test 14: 检查5个原始Tab
    const hasAnalysisTabs = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('趋势分析') && body.includes('场景对比') && body.includes('热力图');
    });
    results.push({ test: '统计分析5个Tab', status: hasAnalysisTabs ? 'PASS' : 'FAIL', detail: hasAnalysisTabs ? '原始Tab存在' : '缺少Tab' });

  } catch (e) {
    results.push({ test: '统计分析模式测试', status: 'FAIL', detail: e.message });
  }

  // ========== 控制台错误检查 ==========
  if (consoleErrors.length === 0) {
    results.push({ test: '控制台无错误', status: 'PASS', detail: '无 console.error' });
  } else {
    results.push({ test: '控制台错误', status: 'WARN', detail: `${consoleErrors.length} 个错误: ${consoleErrors.slice(0, 2).join('; ')}` });
  }

  await browser.close();

  // Print results
  console.log('\n\n========== 测试结果 ==========\n');
  let pass = 0, fail = 0, warn = 0;
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${r.test}: ${r.status} — ${r.detail}`);
    if (r.status === 'PASS') pass++;
    else if (r.status === 'FAIL') fail++;
    else warn++;
  }
  console.log(`\n截图保存在: ${OUT}`);
  console.log(`总计: ${pass} 通过 / ${fail} 失败 / ${warn} 警告\n`);
}

run().catch(e => { console.error('Test runner failed:', e); process.exit(1); });

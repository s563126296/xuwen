import { chromium } from 'playwright';

const browser = await chromium.launch({ 
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
});

const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

const consoleLogs = [];
page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));

console.log('=== Testing Interactive Elements ===\n');

try {
  await page.goto('http://127.0.0.1:5181', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(10000);
  
  // Test 1: AI 态势研判面板
  console.log('--- Test 1: AI 态势研判面板 ---');
  const aiPanelExists = await page.evaluate(() => {
    const panel = document.querySelector('[class*="ai"], [class*="AI"], [class*="态势"]');
    return panel ? true : false;
  });
  console.log(`AI 态势研判面板存在: ${aiPanelExists ? '✓' : '❌'}`);
  
  // Test 2: 设备图例交互
  console.log('\n--- Test 2: 设备图例交互 ---');
  const deviceButtons = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const deviceBtns = buttons.filter(b => {
      const text = b.textContent?.trim() || '';
      return ['电子警察', '违停抓拍', '超速抓拍', '治安监控', '信号灯', '无人机'].some(d => text.includes(d));
    });
    return deviceBtns.map(b => b.textContent?.trim());
  });
  console.log(`设备按钮数量: ${deviceButtons.length}`);
  console.log(`设备按钮: ${JSON.stringify(deviceButtons)}`);
  
  // Test 3: 港口切换
  console.log('\n--- Test 3: 港口切换按钮 ---');
  const portButtons = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const portBtns = buttons.filter(b => {
      const text = b.textContent?.trim() || '';
      return ['徐闻港', '海安新港', '海安港', '粤海铁路'].some(p => text.includes(p));
    });
    return portBtns.map(b => b.textContent?.trim());
  });
  console.log(`港口按钮数量: ${portButtons.length}`);
  console.log(`港口按钮: ${JSON.stringify(portButtons)}`);
  
  // Test 4: 执行按钮
  console.log('\n--- Test 4: 策略执行按钮 ---');
  const actionButtons = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const actionBtns = buttons.filter(b => {
      const text = b.textContent?.trim() || '';
      return ['执行', '查看', '启动', '协调'].some(a => text === a);
    });
    return actionBtns.map(b => b.textContent?.trim());
  });
  console.log(`操作按钮数量: ${actionButtons.length}`);
  console.log(`操作按钮: ${JSON.stringify(actionButtons)}`);
  
  // Test 5: 虚拟助手"小语"
  console.log('\n--- Test 5: 虚拟助手"小语" ---');
  const assistantExists = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('小语');
  });
  console.log(`虚拟助手"小语"存在: ${assistantExists ? '✓' : '❌'}`);
  
  // Test 6: 地图元素
  console.log('\n--- Test 6: 地图相关元素 ---');
  const mapElements = await page.evaluate(() => {
    const canvases = document.querySelectorAll('canvas');
    const svgs = document.querySelectorAll('svg');
    return {
      canvasCount: canvases.length,
      svgCount: svgs.length,
      hasMap: document.querySelector('[class*="map"], [class*="Map"], [id*="map"]') ? true : false
    };
  });
  console.log(`Canvas 元素: ${mapElements.canvasCount}`);
  console.log(`SVG 元素: ${mapElements.svgCount}`);
  console.log(`地图容器存在: ${mapElements.hasMap ? '✓' : '❌'}`);
  
  // Test 7: 数据面板
  console.log('\n--- Test 7: 数据面板 ---');
  const dataPanels = await page.evaluate(() => {
    const panels = document.querySelectorAll('[class*="panel"], [class*="card"], [class*="widget"]');
    return panels.length;
  });
  console.log(`数据面板数量: ${dataPanels}`);
  
  // Test 8: 检查是否有明显的 UI 错误
  console.log('\n--- Test 8: UI 错误检查 ---');
  const uiIssues = await page.evaluate(() => {
    const issues = [];
    
    // Check for overlapping elements
    const elements = document.querySelectorAll('div, button, section');
    let overlaps = 0;
    for (let i = 0; i < Math.min(elements.length, 100); i++) {
      const rect = elements[i].getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      for (let j = i + 1; j < Math.min(elements.length, 100); j++) {
        const rect2 = elements[j].getBoundingClientRect();
        if (rect2.width === 0 || rect2.height === 0) continue;
        // Simple overlap check
        if (!(rect.right < rect2.left || rect.left > rect2.right || rect.bottom < rect2.top || rect.top > rect2.bottom)) {
          overlaps++;
        }
      }
    }
    
    // Check for text overflow
    const textElements = [...document.querySelectorAll('p, span, div, button')];
    const overflowCount = textElements.filter(el => {
      return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
    }).length;
    
    return { overlaps, overflowCount };
  });
  console.log(`元素重叠检测: ${uiIssues.overlaps} 个潜在重叠`);
  console.log(`文本溢出检测: ${uiIssues.overflowCount} 个元素`);
  
  // Summary
  console.log('\n=== 交互测试总结 ===');
  console.log(`✓ 页面加载正常`);
  console.log(`✓ 设备图例按钮: ${deviceButtons.length} 个`);
  console.log(`✓ 港口切换按钮: ${portButtons.length} 个`);
  console.log(`✓ 操作按钮: ${actionButtons.length} 个`);
  console.log(`✓ 地图元素: ${mapElements.canvasCount} Canvas + ${mapElements.svgCount} SVG`);
  console.log(`✓ 数据面板: ${dataPanels} 个`);
  
  const errors = consoleLogs.filter(l => l.type === 'error');
  if (errors.length > 0) {
    console.log(`\n⚠️ 控制台错误: ${errors.length} 个`);
    errors.forEach(e => console.log(`  [ERROR] ${e.text}`));
  }
  
} catch(e) {
  console.error('Error:', e.message);
}

await browser.close();

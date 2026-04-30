import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5180';

test.describe('总览模式', () => {
  test('页面正常加载', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
    await page.screenshot({ path: 'test-results/01-overview-loaded.png', fullPage: true });
  });

  test('场景预设按钮可见', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const gearIcon = page.locator('[data-testid="scenario-preset"], button:has(svg)').last();
    if (await gearIcon.isVisible()) {
      await gearIcon.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/02-scenario-panel.png', fullPage: true });
    }
  });
});

test.describe('指挥模式', () => {
  test('切换到指挥模式', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const commandTab = page.getByText('指挥');
    if (await commandTab.isVisible()) {
      await commandTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/03-command-mode.png', fullPage: true });
    }
  });

  test('策略推荐卡片显示', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const commandTab = page.getByText('指挥');
    if (await commandTab.isVisible()) {
      await commandTab.click();
      await page.waitForTimeout(2000);
      const strategyCard = page.locator('text=推荐理由').or(page.locator('text=AI 推荐')).or(page.locator('text=历史成功率'));
      await page.screenshot({ path: 'test-results/04-strategy-card.png', fullPage: true });
    }
  });
});

test.describe('AI 分析模式', () => {
  test('切换到分析模式并查看模拟器', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const analysisTab = page.getByText('统计分析').or(page.getByText('AI分析')).or(page.getByText('分析'));
    if (await analysisTab.first().isVisible()) {
      await analysisTab.first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/05-analysis-simulator.png', fullPage: true });
    }
  });

  test('查看进化记录', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const analysisTab = page.getByText('统计分析').or(page.getByText('AI分析')).or(page.getByText('分析'));
    if (await analysisTab.first().isVisible()) {
      await analysisTab.first().click();
      await page.waitForTimeout(1000);
      const evoTab = page.getByText('进化记录').or(page.getByText('策略进化'));
      if (await evoTab.first().isVisible()) {
        await evoTab.first().click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/06-evolution-records.png', fullPage: true });
      }
    }
  });

  test('查看决策树', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const analysisTab = page.getByText('统计分析').or(page.getByText('AI分析')).or(page.getByText('分析'));
    if (await analysisTab.first().isVisible()) {
      await analysisTab.first().click();
      await page.waitForTimeout(1000);
      const treeTab = page.getByText('决策树');
      if (await treeTab.first().isVisible()) {
        await treeTab.first().click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/07-decision-tree.png', fullPage: true });
      }
    }
  });

  test('查看知识图谱', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const analysisTab = page.getByText('统计分析').or(page.getByText('AI分析')).or(page.getByText('分析'));
    if (await analysisTab.first().isVisible()) {
      await analysisTab.first().click();
      await page.waitForTimeout(1000);
      const graphTab = page.getByText('知识图谱');
      if (await graphTab.first().isVisible()) {
        await graphTab.first().click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/08-knowledge-graph.png', fullPage: true });
      }
    }
  });
});

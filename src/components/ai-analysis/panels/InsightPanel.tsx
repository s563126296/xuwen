import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { HelpCircle, TrendingUp } from 'lucide-react';

const COLORS = {
  primary: '#4da6ff',
  accent: '#f0b429',
  success: '#34d399',
  danger: '#f87171',
};

function generateCongestionData(days: number, startDate: Date, isPrediction: boolean) {
  const data: number[] = [];
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < days; i++) {
    const dow = (startDate.getDay() + i) % 7;
    const weekdayFactor = dow === 0 || dow === 6 ? 0.75 : 1.0;
    const fridayBoost = dow === 5 ? 0.25 : 0;
    const mondayBoost = dow === 1 ? 0.15 : 0;
    const wave = Math.sin((i + 2) / 3.5) * 0.3;
    const noise = Math.sin(i * 7.3 + 1.7) * 0.08;

    const value = (1.75 + wave + fridayBoost + mondayBoost + noise) * weekdayFactor;
    const clamped = Math.max(1.0, Math.min(3.0, value));
    data.push(parseFloat(clamped.toFixed(2)));

    if (isPrediction) {
      const spread = 0.12 + (i / days) * 0.18;
      upper.push(parseFloat(Math.min(3.0, clamped + spread).toFixed(2)));
      lower.push(parseFloat(Math.max(1.0, clamped - spread).toFixed(2)));
    } else {
      upper.push(parseFloat(clamped.toFixed(2)));
      lower.push(parseFloat(clamped.toFixed(2)));
    }
  }

  return { data, upper, lower };
}

interface TooltipParam {
  dataIndex: number;
  seriesName: string;
  value: number | null;
  marker: string;
}

export default function InsightPanel() {
  const [viewMode, setViewMode] = useState<'7day' | '30day'>('7day');

  const { allDates, historical, predicted, stats } = useMemo(() => {
    const days = viewMode === '7day' ? 7 : 30;
    const today = new Date(2026, 3, 20);

    const histStart = new Date(today);
    histStart.setDate(histStart.getDate() - days);

    const hist = generateCongestionData(days, histStart, false);
    const pred = generateCongestionData(days, today, true);

    const dates: string[] = [];
    for (let i = 0; i < days * 2; i++) {
      const d = new Date(histStart);
      d.setDate(d.getDate() + i);
      dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }

    const currentIdx = hist.data[hist.data.length - 1];
    const baseIdx = hist.data[0];
    const trendPct = ((currentIdx - baseIdx) / baseIdx) * 100;
    const peakVal = Math.max(...pred.data);
    const peakPos = pred.data.indexOf(peakVal);
    const peakDate = dates[days + peakPos];

    return {
      allDates: dates,
      historical: hist,
      predicted: pred,
      stats: {
        current: currentIdx,
        trend: parseFloat(trendPct.toFixed(1)),
        peakDate,
        peakIndex: peakVal,
      },
    };
  }, [viewMode]);

  const days = viewMode === '7day' ? 7 : 30;

  const option = useMemo<EChartsOption>(() => {
    const histLine = [
      ...historical.data,
      predicted.data[0],
      ...Array(days - 1).fill(null),
    ];

    const predLine = [
      ...Array(days - 1).fill(null),
      historical.data[historical.data.length - 1],
      ...predicted.data,
    ];

    const upperBand = [
      ...Array(days - 1).fill(null),
      historical.data[historical.data.length - 1],
      ...predicted.upper,
    ];

    const lowerBand = [
      ...Array(days - 1).fill(null),
      historical.data[historical.data.length - 1],
      ...predicted.lower,
    ];

    return {
      backgroundColor: 'transparent',
      grid: { left: 42, right: 16, top: 32, bottom: 28 },
      legend: {
        top: 4,
        right: 8,
        itemWidth: 16,
        itemHeight: 2,
        textStyle: { color: 'rgba(180,200,220,0.55)', fontSize: 10 },
        data: ['历史数据', '预测趋势'],
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(12,25,48,0.9)',
        borderColor: 'rgba(77,166,255,0.2)',
        borderWidth: 1,
        textStyle: { color: '#fff', fontSize: 11 },
        formatter: (params: unknown) => {
          const items = Array.isArray(params) ? params as TooltipParam[] : [];
          if (items.length === 0) return '';

          const idx = items[0].dataIndex;
          const date = allDates[idx];
          let html = `<div style="font-size:11px;margin-bottom:4px">${date}</div>`;
          for (const item of items) {
            if (item.seriesName === '置信上界' || item.seriesName === '置信下界') continue;
            if (item.value == null) continue;
            html += `${item.marker} ${item.seriesName}: <b>${item.value}</b><br/>`;
          }

          const upperVal = upperBand[idx];
          const lowerVal = lowerBand[idx];
          if (upperVal != null && lowerVal != null && idx >= days) {
            html += `<span style="color:rgba(77,166,255,0.6)">置信区间: ${lowerVal} ~ ${upperVal}</span>`;
          }
          return html;
        },
      },
      xAxis: {
        type: 'category',
        data: allDates,
        axisLine: { lineStyle: { color: 'rgba(180,200,220,0.12)' } },
        axisLabel: {
          color: 'rgba(180,200,220,0.45)',
          fontSize: 9,
          fontFamily: 'JetBrains Mono',
          interval: viewMode === '7day' ? 1 : 4,
        },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 1.0,
        max: 3.0,
        interval: 0.5,
        axisLine: { show: false },
        axisLabel: {
          color: 'rgba(180,200,220,0.45)',
          fontSize: 9,
          fontFamily: 'JetBrains Mono',
          formatter: '{value}',
        },
        splitLine: { lineStyle: { color: 'rgba(180,200,220,0.06)' } },
      },
      series: [
        {
          name: '置信上界',
          type: 'line',
          data: upperBand,
          symbol: 'none',
          lineStyle: { width: 0 },
          areaStyle: { color: 'rgba(77,166,255,0.08)' },
          stack: 'confidence',
          z: 1,
          silent: true,
        },
        {
          name: '置信下界',
          type: 'line',
          data: lowerBand,
          symbol: 'none',
          lineStyle: { width: 0 },
          areaStyle: { color: 'rgba(0,0,0,0)' },
          stack: 'confidence',
          z: 1,
          silent: true,
        },
        {
          name: '历史数据',
          type: 'line',
          data: histLine,
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          showSymbol: false,
          lineStyle: { color: COLORS.primary, width: 2 },
          itemStyle: { color: COLORS.primary },
          z: 3,
        },
        {
          name: '预测趋势',
          type: 'line',
          data: predLine,
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          showSymbol: false,
          lineStyle: {
            color: 'rgba(77,166,255,0.6)',
            width: 2,
            type: 'dashed',
          },
          itemStyle: { color: 'rgba(77,166,255,0.6)' },
          z: 3,
        },
        {
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              color: 'rgba(240,180,41,0.5)',
              type: 'dashed',
              width: 1,
            },
            data: [{ xAxis: allDates[days - 1] }],
            label: {
              formatter: '今日',
              color: 'rgba(240,180,41,0.7)',
              fontSize: 9,
              position: 'insideEndTop',
            },
          },
          data: [],
        },
      ],
    };
  }, [allDates, historical, predicted, days, viewMode]);

  const trendUp = stats.trend > 0;

  return (
    <div className="ai-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="ai-panel__header" style={{ flexShrink: 0 }}>
        <TrendingUp size={15} />
        <h3>趋势预测</h3>
        <span className="ai-panel__badge">AI</span>
      </div>

      <div className="ai-panel__body" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div className="xw-analysis-card-body">
          <div className="xw-analysis-card-topline">
            <div className="xw-analysis-card-title">
              <span>趋势预测</span>
              <span className="xw-help-tip" title="基于历史拥堵数据和XGBoost模型，预测未来拥堵趋势。置信区间表示预测不确定性范围。">
                <HelpCircle size={12} />
              </span>
            </div>
            <div className="xw-analysis-toggle">
              {(['7day', '30day'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={viewMode === mode ? 'active' : ''}
                >
                  {mode === '7day' ? '7天' : '30天'}
                </button>
              ))}
            </div>
          </div>

          <div className="xw-analysis-stats">
            <div className="stat-mini">
              <span>当前指数</span>
              <strong className="data-glow" style={{ color: COLORS.primary }}>
                {stats.current.toFixed(2)}
              </strong>
            </div>
            <div className="stat-mini">
              <span>{viewMode === '7day' ? '7日' : '30日'}趋势</span>
              <strong style={{ color: trendUp ? COLORS.danger : COLORS.success }}>
                {trendUp ? '↑' : '↓'} {Math.abs(stats.trend)}%
              </strong>
            </div>
            <div className="stat-mini">
              <span>峰值预测</span>
              <strong style={{ color: COLORS.accent }}>
                {stats.peakDate} ({stats.peakIndex.toFixed(1)})
              </strong>
            </div>
          </div>

          <div className="xw-analysis-chart">
            <ReactECharts option={option} style={{ width: '100%', height: '100%' }} opts={{ renderer: 'canvas' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

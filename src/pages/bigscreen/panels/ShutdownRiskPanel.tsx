import ReactECharts from 'echarts-for-react';
import PanelFrame from '../components/PanelFrame';
import { useDashboardStore } from '../../../store/dashboardStore';
import type { ShutdownLevel } from '../../../store/dashboardStore';

const levelColorMap: Record<ShutdownLevel, string> = {
  low: '#00D9FF',
  attention: '#4FC3F7',
  warning: '#FFA726',
  danger: '#FF5A5F',
};

export default function ShutdownRiskPanel() {
  const data = useDashboardStore((s) => s.shutdownProbability);

  const xLabels = data.windows.map((w) => `${w.hours}h`);
  const values = data.windows.map((w) => ({
    value: w.probability,
    itemStyle: {
      color: levelColorMap[w.level],
      borderRadius: [4, 4, 0, 0] as [number, number, number, number],
    },
  }));

  const option: echarts.EChartsOption = {
    grid: { top: 16, right: 16, bottom: 28, left: 40 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10,14,39,0.9)',
      borderColor: 'rgba(0,240,255,0.2)',
      textStyle: { color: 'rgba(224,232,255,0.65)', fontSize: 12 },
      formatter: (params: unknown) => {
        const p = (params as Array<{ name: string; value: number }>)[0];
        return `${p.name}: ${p.value}%`;
      },
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLine: { lineStyle: { color: 'rgba(0,240,255,0.2)' } },
      axisLabel: { color: 'rgba(224,232,255,0.65)', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: 'rgba(224,232,255,0.65)', fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(0,240,255,0.06)' } },
    },
    series: [
      {
        type: 'bar',
        data: values,
        barWidth: 28,
        label: {
          show: true,
          position: 'top',
          color: 'rgba(224,232,255,0.65)',
          fontSize: 12,
          fontFamily: 'DIN Alternate, DIN, Roboto Mono, monospace',
          formatter: '{c}%',
        },
      },
    ],
  };

  return (
    <PanelFrame title="停航风险">
      <ReactECharts
        option={option}
        style={{ flex: 1, minHeight: 0 }}
        opts={{ renderer: 'canvas' }}
      />
      <div className="bs-text-xs bs-text-secondary bs-mt-8">{data.drivingFactor}</div>
    </PanelFrame>
  );
}

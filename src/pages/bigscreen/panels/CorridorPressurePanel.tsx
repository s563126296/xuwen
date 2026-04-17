import ReactECharts from 'echarts-for-react';
import PanelFrame from '../components/PanelFrame';
import { useDashboardStore } from '../../../store/dashboardStore';
import type { CorridorDirection } from '../../../store/dashboardStore';

const directionOrder: CorridorDirection[] = ['south', 'north', 'west', 'east'];
const directionLabels: Record<CorridorDirection, string> = {
  south: '南',
  north: '北',
  east: '东',
  west: '西',
};

function getBarColor(pressure: number): string {
  if (pressure > 90) return '#FF5A5F';
  if (pressure > 80) return '#FFA726';
  return '#00D9FF';
}

export default function CorridorPressurePanel() {
  const corridorPressure = useDashboardStore((s) => s.corridorPressure);

  const items = directionOrder.map((d) => corridorPressure[d]);
  const names = directionOrder.map((d) => directionLabels[d]);
  const values = items.map((c) => c.pressure);

  const option: echarts.EChartsOption = {
    grid: { top: 8, right: 48, bottom: 8, left: 36 },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { show: false },
      axisLine: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: names,
      inverse: true,
      axisLine: { lineStyle: { color: 'rgba(0,240,255,0.2)' } },
      axisLabel: { color: 'rgba(224,232,255,0.65)', fontSize: 12 },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: values.map((v) => ({
          value: v,
          itemStyle: {
            color: getBarColor(v),
            borderRadius: [0, 4, 4, 0],
          },
        })),
        barWidth: 14,
        label: {
          show: true,
          position: 'right',
          color: 'rgba(224,232,255,0.65)',
          fontSize: 12,
          fontFamily: 'DIN Alternate, DIN, Roboto Mono, monospace',
          formatter: '{c}%',
        },
      },
    ],
  };

  return (
    <PanelFrame title="通道压力">
      <ReactECharts
        option={option}
        style={{ flex: 1, minHeight: 0 }}
        opts={{ renderer: 'canvas' }}
      />
    </PanelFrame>
  );
}

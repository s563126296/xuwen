import ReactECharts from 'echarts-for-react';
import { useOverviewStore } from '../../../stores/overviewStore';

const statusLabelMap: Record<string, string> = {
  normal: '正常通航',
  caution: '谨慎通航',
  restricted: '限制通航',
  closed: '停航',
};

export default function TransitGauge() {
  const data = useOverviewStore((s) => s.straitTransitIndex);

  const option: echarts.EChartsOption = {
    series: [
      // Outer decorative ring
      {
        type: 'gauge',
        radius: '95%',
        startAngle: 220,
        endAngle: -40,
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: {
            width: 2,
            color: [[1, 'rgba(0,240,255,0.15)']],
          },
        },
        axisTick: {
          length: 6,
          distance: -8,
          lineStyle: { color: 'rgba(0,240,255,0.3)', width: 1 },
        },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        detail: { show: false },
        data: [{ value: 0 }],
      },
      // Main gauge
      {
        type: 'gauge',
        radius: '85%',
        startAngle: 220,
        endAngle: -40,
        min: 0,
        max: 100,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 16,
            color: [
              [0.25, '#ff4757'],
              [0.5, '#ffc107'],
              [0.75, '#1890ff'],
              [1, '#00f0ff'],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: {
          length: '50%',
          width: 5,
          offsetCenter: [0, 0],
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#00f0ff' },
                { offset: 1, color: 'rgba(0,240,255,0.2)' },
              ],
            },
            shadowColor: 'rgba(0,240,255,0.6)',
            shadowBlur: 12,
          },
        },
        anchor: {
          show: true,
          size: 12,
          itemStyle: {
            color: '#0a0e27',
            borderWidth: 3,
            borderColor: '#00f0ff',
            shadowColor: 'rgba(0,240,255,0.8)',
            shadowBlur: 16,
          },
        },
        detail: {
          valueAnimation: true,
          fontSize: 36,
          fontFamily: 'DIN Alternate, DIN, Roboto Mono, monospace',
          fontWeight: 700,
          color: '#00f0ff',
          offsetCenter: [0, '35%'],
          formatter: '{value}',
          textShadowColor: 'rgba(0,240,255,0.5)',
          textShadowBlur: 20,
        },
        title: {
          offsetCenter: [0, '58%'],
          fontSize: 14,
          color: 'rgba(224,232,255,0.65)',
        },
        data: [
          {
            value: data.indexValue,
            name: statusLabelMap[data.navigationStatus] || data.navigationStatus,
          },
        ],
        animationDuration: 1500,
        animationEasingUpdate: 'cubicOut',
      },
    ],
  };

  return (
    <div className="bs-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="bs-panel-title">海峡通行指数</div>
      <ReactECharts
        option={option}
        style={{ flex: 1, minHeight: 0 }}
        opts={{ renderer: 'canvas' }}
      />
      <div className="bs-flex bs-justify-between bs-text-sm bs-text-secondary">
        <span>风力: <span className="bs-text-cyan">{data.windLevel} 级</span></span>
        <span>能见度: <span className="bs-text-cyan">{data.visibility}</span></span>
      </div>
    </div>
  );
}

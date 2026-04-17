import ReactECharts from 'echarts-for-react';
import PanelFrame from '../components/PanelFrame';
import FlipNumber from '../components/FlipNumber';
import { useDashboardStore } from '../../../store/dashboardStore';

const dimensionLabels = ['通道冗余', '备选路线', '调控空间', '港口缓冲'];

export default function ResilienceRadar() {
  const data = useDashboardStore((s) => s.systemResilience);

  const scores = [
    data.subScores.corridorRedundancy,
    data.subScores.alternateRoutes,
    data.subScores.controlCapacity,
    data.subScores.portBuffer,
  ];

  const option: echarts.EChartsOption = {
    radar: {
      indicator: dimensionLabels.map((name) => ({ name, max: 100 })),
      shape: 'polygon',
      radius: '60%',
      axisName: { color: 'rgba(224,232,255,0.65)', fontSize: 11 },
      splitArea: { areaStyle: { color: ['transparent'] } },
      splitLine: { lineStyle: { color: 'rgba(0,240,255,0.1)' } },
      axisLine: { lineStyle: { color: 'rgba(0,240,255,0.15)' } },
    },
    series: [
      {
        type: 'radar',
        data: [{ value: scores }],
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#00f0ff', width: 2 },
        itemStyle: { color: '#00f0ff' },
        areaStyle: { color: 'rgba(0,240,255,0.15)' },
      },
    ],
  };

  return (
    <PanelFrame title="系统韧性">
      {/* Center score overlay */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <FlipNumber value={data.score} digits={2} style={{ fontSize: 32 }} />
          <div className="bs-text-xs bs-text-secondary" style={{ marginTop: 2 }}>韧性总分</div>
        </div>
      </div>
      <div className="bs-text-xs bs-text-secondary" style={{ textAlign: 'center' }}>
        最弱维度: <span className="bs-text-yellow">{data.weakestDimension}</span>
      </div>
    </PanelFrame>
  );
}

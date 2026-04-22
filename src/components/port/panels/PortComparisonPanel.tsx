import React from 'react';
import { GitCompare } from 'lucide-react';
import { usePortStore } from '../../../stores/portStore';
import { usePortPanelStore } from '../../../stores/portPanelStore';
import CollapsibleCard from '../../common/CollapsibleCard';

interface ComparisonRowProps {
  label: string;
  xuwenValue: number;
  haianValue: number;
  unit: string;
  isPercentage?: boolean;
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({ label, xuwenValue, haianValue, unit, isPercentage = false }) => {
  const maxValue = Math.max(xuwenValue, haianValue);
  const xuwenPercent = (xuwenValue / maxValue) * 50;
  const haianPercent = (haianValue / maxValue) * 50;

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: '#999', marginBottom: 4, textAlign: 'center' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 11, color: '#00D0E9', fontWeight: 600, minWidth: 45, textAlign: 'right' }}>
            {xuwenValue}{isPercentage ? '%' : unit}
          </div>
          <div style={{ position: 'relative', width: '100%', height: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: 0, top: 0, width: `${xuwenPercent}%`, height: '100%', background: '#00D0E9', transition: 'width 0.3s ease' }} />
          </div>
        </div>
        <div style={{ width: 2, height: 20, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ position: 'relative', width: '100%', height: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: `${haianPercent}%`, height: '100%', background: '#F5A623', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ fontSize: 11, color: '#F5A623', fontWeight: 600, minWidth: 45 }}>
            {haianValue}{isPercentage ? '%' : unit}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PortComparisonPanel: React.FC = () => {
  const comparison = usePortStore((state) => state.comparison);

  const rightExpanded = usePortPanelStore((s) => s.rightExpanded);
  const toggleRight = usePortPanelStore((s) => s.toggleRight);
  const isExpanded = rightExpanded.includes('comparison');

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      徐闻 <span style={{ color: '#00D0E9', fontWeight: 600 }}>{comparison.xuwen.todayVolume}辆</span> ·
      海安 <span style={{ color: '#F5A623', fontWeight: 600 }}>{comparison.haian.todayVolume}辆</span> ·
      装载率 <span style={{ color: '#4da6ff' }}>{comparison.xuwen.loadRate}%/{comparison.haian.loadRate}%</span>
    </div>
  );

  return (
    <CollapsibleCard
      title="两港对比"
      icon={<GitCompare size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      expanded={isExpanded}
      onToggle={() => toggleRight('comparison')}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#00D0E9' }}>徐闻港</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#F5A623' }}>海安新港</div>
        </div>
        <ComparisonRow label="日均班次" xuwenValue={comparison.xuwen.dailyTrips} haianValue={comparison.haian.dailyTrips} unit="班" />
        <ComparisonRow label="今日运量" xuwenValue={comparison.xuwen.todayVolume} haianValue={comparison.haian.todayVolume} unit="辆" />
        <ComparisonRow label="装载率" xuwenValue={comparison.xuwen.loadRate} haianValue={comparison.haian.loadRate} unit="" isPercentage />
        <ComparisonRow label="平均等待" xuwenValue={comparison.xuwen.avgWait} haianValue={comparison.haian.avgWait} unit="分钟" />
      </div>
    </CollapsibleCard>
  );
};

import React from 'react';
import { GitCompare } from 'lucide-react';
import { usePortStore } from '../../../stores/portStore';

const panelStyle: React.CSSProperties = {
  background: 'rgba(0,20,40,0.85)',
  border: '1px solid rgba(0,208,233,0.2)',
  borderRadius: 8,
  padding: '12px 14px',
  backdropFilter: 'blur(8px)',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
};

const titleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#00D0E9',
  marginBottom: 10,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexShrink: 0,
};

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
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: '#999', marginBottom: 6, textAlign: 'center' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 12, color: '#00D0E9', fontWeight: 600, minWidth: 50, textAlign: 'right' }}>
            {xuwenValue}{isPercentage ? '%' : unit}
          </div>
          <div style={{ position: 'relative', width: '100%', height: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: `${xuwenPercent}%`,
                height: '100%',
                background: '#00D0E9',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
        <div style={{ width: 2, height: 24, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ position: 'relative', width: '100%', height: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: `${haianPercent}%`,
                height: '100%',
                background: '#F5A623',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: '#F5A623', fontWeight: 600, minWidth: 50 }}>
            {haianValue}{isPercentage ? '%' : unit}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PortComparisonPanel: React.FC = () => {
  const comparison = usePortStore((state) => state.comparison);

  return (
    <div style={panelStyle}>
      <div style={titleStyle}>
        <GitCompare size={14} />
        两港对比
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#00D0E9' }}>徐闻港</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#F5A623' }}>海安新港</div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <ComparisonRow
          label="日均班次"
          xuwenValue={comparison.xuwen.dailyTrips}
          haianValue={comparison.haian.dailyTrips}
          unit="班"
        />
        <ComparisonRow
          label="今日运量"
          xuwenValue={comparison.xuwen.todayVolume}
          haianValue={comparison.haian.todayVolume}
          unit="辆"
        />
        <ComparisonRow
          label="装载率"
          xuwenValue={comparison.xuwen.loadRate}
          haianValue={comparison.haian.loadRate}
          unit=""
          isPercentage
        />
        <ComparisonRow
          label="平均等待"
          xuwenValue={comparison.xuwen.avgWait}
          haianValue={comparison.haian.avgWait}
          unit="分钟"
        />
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Package, Pencil, Check, AlertTriangle } from 'lucide-react';
import CollapsibleCard from '../common/CollapsibleCard';
import type { CommandStrategy, CommandResourceStatus, ResourceRequirement } from '../../stores/commandStore';

interface ResourceDecisionPanelProps {
  strategy: CommandStrategy;
  resources: CommandResourceStatus;
  executionResources: {
    materials: Array<{ name: string; total: number; ready: number; unit: string }>;
  };
}

// Map resource type to Chinese label and unit
const RESOURCE_LABELS: Record<ResourceRequirement['type'], { label: string; unit: string }> = {
  police: { label: '交警', unit: '人' },
  tow_truck: { label: '拖车', unit: '台' },
  cone: { label: '锥桶', unit: '个' },
  led_screen: { label: '诱导屏', unit: '块' },
};

function getAvailableCount(
  type: ResourceRequirement['type'],
  resources: CommandResourceStatus,
  materials: Array<{ name: string; total: number; ready: number; unit: string }>,
): number {
  switch (type) {
    case 'police':
      return resources.policeAvailable;
    case 'tow_truck':
      return resources.towTrucksAvailable;
    case 'cone': {
      const cone = materials.find((m) => m.name === '锥桶');
      return cone?.ready ?? 0;
    }
    case 'led_screen': {
      const led = materials.find((m) => m.name === '诱导屏');
      return led?.ready ?? 0;
    }
  }
}

export default function ResourceDecisionPanel({ strategy, resources, executionResources }: ResourceDecisionPanelProps) {
  const reqs = strategy.requiredResources ?? [];
  const [arrivalOverrides, setArrivalOverrides] = useState<Record<string, number>>({});
  const [editingType, setEditingType] = useState<string | null>(null);

  if (reqs.length === 0) return null;

  // Build status for each resource
  const items = reqs.map((req) => {
    const available = getAvailableCount(req.type, resources, executionResources.materials);
    const satisfied = available >= req.quantity;
    const arrival = arrivalOverrides[req.type] ?? req.estimatedArrivalMin;
    const meta = RESOURCE_LABELS[req.type];
    return { ...req, available, satisfied, arrival, label: meta.label, unit: meta.unit };
  });

  const allSatisfied = items.every((i) => i.satisfied);
  const maxArrival = Math.max(...items.map((i) => i.arrival));
  const insufficientItems = items.filter((i) => !i.satisfied);

  const handleArrivalChange = (type: string, value: number) => {
    setArrivalOverrides((prev) => ({ ...prev, [type]: Math.max(1, Math.min(120, value)) }));
  };

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      {allSatisfied ? (
        <span style={{ color: '#2ED573' }}>
          <Check size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
          全部满足
        </span>
      ) : (
        <span style={{ color: '#F5A623' }}>
          <AlertTriangle size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
          {insufficientItems.length} 项不足
        </span>
      )}
      {' · '}
      预计 <span style={{ fontFamily: 'DIN, sans-serif', color: '#00D0E9' }}>{maxArrival}</span> min 到位
    </div>
  );

  return (
    <CollapsibleCard
      title="执行所需资源"
      icon={<Package size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      defaultExpanded={true}
    >
      {/* Resource list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((item) => (
          <div
            key={item.type}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: item.satisfied ? '#2ED573' : '#F5A623',
                boxShadow: item.satisfied
                  ? '0 0 6px rgba(46,213,115,0.4)'
                  : '0 0 6px rgba(245,166,35,0.4)',
              }} />
              <span style={{ fontSize: 11, color: '#C0D0E0' }}>{item.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: item.satisfied ? '#5588AA' : '#F5A623' }}>
                需 {item.quantity}{item.unit} / 可用 {item.available}{item.unit}
              </span>
              {/* Arrival time with edit */}
              {editingType === item.type ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <input
                    type="number"
                    value={item.arrival}
                    min={1}
                    max={120}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleArrivalChange(item.type, parseInt(e.target.value) || 1)}
                    onBlur={() => setEditingType(null)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setEditingType(null); }}
                    autoFocus
                    style={{
                      width: 36, background: '#152535', border: '1px solid #2A3A4A',
                      borderRadius: 3, padding: '2px 4px', color: '#00D0E9',
                      fontSize: 10, textAlign: 'center', outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: 9, color: '#5588AA' }}>min</span>
                </div>
              ) : (
                <div
                  onClick={(e) => { e.stopPropagation(); setEditingType(item.type); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer',
                    padding: '2px 6px', borderRadius: 3,
                    background: 'rgba(0,208,233,0.06)',
                  }}
                >
                  <span style={{ fontSize: 10, color: '#00D0E9', fontFamily: 'DIN, sans-serif' }}>
                    {item.arrival}min
                  </span>
                  <Pencil size={8} style={{ color: '#5588AA' }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Overall arrival time */}
      <div style={{
        marginTop: 10, padding: '8px 10px', borderRadius: 6,
        background: '#0A1520', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 10, color: '#7788AA' }}>预计资源到位时间</span>
        <span style={{ fontSize: 12, color: '#00D0E9', fontFamily: 'DIN, sans-serif', fontWeight: 600 }}>
          {maxArrival} 分钟
        </span>
      </div>
      <div style={{ fontSize: 9, color: '#556677', marginTop: 4, paddingLeft: 2 }}>
        基于历史平均到位时间，可点击各项手动修正
      </div>

      {/* Insufficient resource suggestions */}
      {insufficientItems.length > 0 && (
        <div style={{
          marginTop: 10, padding: '8px 10px', borderRadius: 6,
          background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)',
        }}>
          <div style={{ fontSize: 10, color: '#F5A623', marginBottom: 4, fontWeight: 600 }}>
            <AlertTriangle size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            资源不足建议
          </div>
          {insufficientItems.map((item) => {
            const deficit = item.quantity - item.available;
            return (
              <div key={item.type} style={{ fontSize: 10, color: '#8899AA', lineHeight: 1.6 }}>
                {item.label}缺 {deficit}{item.unit}，建议从邻近岗位调配或申请增援
              </div>
            );
          })}
        </div>
      )}
    </CollapsibleCard>
  );
}

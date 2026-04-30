import { useState } from 'react';
import { Search, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { useAnalysisStore } from '../../stores';
import type { HistoryEventType } from '../../stores';

const EVENT_TYPE_OPTIONS: { value: HistoryEventType; label: string }[] = [
  { value: 'congestion', label: '拥堵事件' },
  { value: 'typhoon', label: '台风停航' },
  { value: 'fog', label: '大雾停航' },
  { value: 'spring_rush', label: '春运高峰' },
  { value: 'accident', label: '交通事故' },
  { value: 'normal', label: '日常运行' },
];

const REGION_OPTIONS = [
  { value: 'all', label: '全域' },
  { value: 'port_road', label: '进港大道' },
  { value: 's376', label: 'S376省道' },
  { value: 'g207', label: 'G207国道' },
  { value: 'county', label: '县城区域' },
  { value: 'port', label: '港口区域' },
];

export default function QueryFilterPanel() {
  const analysisState = useAnalysisStore((s) => s.analysisState);
  const setAnalysisFilters = useAnalysisStore((s) => s.setAnalysisFilters);
  const { filters } = analysisState;
  const [localFilters, setLocalFilters] = useState(filters);

  const handleQuery = () => {
    setAnalysisFilters(localFilters);
  };

  return (
    <div style={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: 8,
      backdropFilter: 'blur(var(--glass-blur))',
      padding: 16,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Search size={14} color="#4DA6FF" />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>查询条件</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Date range */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <Calendar size={11} color="#A0A8B4" />
            <span style={{ fontSize: 11, color: '#A0A8B4' }}>时间范围</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="date" value={localFilters.dateRange.start} onChange={(e) => setLocalFilters({ ...localFilters, dateRange: { ...localFilters.dateRange, start: e.target.value } })}
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '4px 6px', fontSize: 11, color: '#E2E8F0' }} />
            <input type="date" value={localFilters.dateRange.end} onChange={(e) => setLocalFilters({ ...localFilters, dateRange: { ...localFilters.dateRange, end: e.target.value } })}
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '4px 6px', fontSize: 11, color: '#E2E8F0' }} />
          </div>
        </div>

        {/* Event types */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <AlertTriangle size={11} color="#A0A8B4" />
            <span style={{ fontSize: 11, color: '#A0A8B4' }}>事件类型</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {EVENT_TYPE_OPTIONS.map(opt => {
              const selected = localFilters.eventTypes.includes(opt.value);
              return (
                <button key={opt.value} onClick={() => {
                  const newTypes = selected ? localFilters.eventTypes.filter(t => t !== opt.value) : [...localFilters.eventTypes, opt.value];
                  setLocalFilters({ ...localFilters, eventTypes: newTypes });
                }} style={{
                  padding: '3px 8px', fontSize: 10, borderRadius: 4, border: '1px solid', cursor: 'pointer',
                  background: selected ? 'rgba(77, 166, 255, 0.15)' : 'rgba(0,0,0,0.3)',
                  borderColor: selected ? '#4DA6FF' : 'rgba(255,255,255,0.1)',
                  color: selected ? '#4DA6FF' : '#A0A8B4',
                }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Region */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <MapPin size={11} color="#A0A8B4" />
            <span style={{ fontSize: 11, color: '#A0A8B4' }}>区域筛选</span>
          </div>
          <select value={localFilters.region} onChange={(e) => setLocalFilters({ ...localFilters, region: e.target.value as typeof localFilters.region })}
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '4px 6px', fontSize: 11, color: '#E2E8F0' }}>
            {REGION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        {/* Query button */}
        <button onClick={handleQuery} style={{
          marginTop: 4, padding: '6px 12px', background: 'linear-gradient(135deg, #4DA6FF 0%, #3B82F6 100%)',
          border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#FFF', cursor: 'pointer',
        }}>
          查询
        </button>
      </div>
    </div>
  );
}

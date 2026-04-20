import { Map, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';

const deviceTypes = [
  { id: 'all', label: '全部', color: '#00D0E9' },
  { id: 'police', label: '电子警察', color: '#DC2626' },
  { id: 'parking', label: '违停抓拍', color: '#F5A623' },
  { id: 'checkpoint', label: '治安卡口', color: '#00D0E9' },
  { id: 'speed', label: '超速抓拍', color: '#A855F7' },
  { id: 'signal', label: '信号灯', color: '#2ED573' },
  { id: 'screen', label: '发布屏', color: '#3B82F6' },
] as const;

export type DeviceTypeId = typeof deviceTypes[number]['id'];

interface MapHeaderProps {
  leftCollapsed?: boolean;
  rightCollapsed?: boolean;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
  activeFilter: DeviceTypeId;
  onFilterChange: (filter: DeviceTypeId) => void;
  dronesActive: boolean;
  onDronesToggle: () => void;
}

export default function MapHeader({
  leftCollapsed,
  rightCollapsed,
  onToggleLeft,
  onToggleRight,
  activeFilter,
  onFilterChange,
  dronesActive,
  onDronesToggle,
}: MapHeaderProps) {
  return (
    <div className="module-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {onToggleLeft && (
          <button
            onClick={onToggleLeft}
            title={leftCollapsed ? '展开左侧面板' : '收起左侧面板'}
            aria-label={leftCollapsed ? '展开左侧面板' : '收起左侧面板'}
            style={{
              background: 'rgba(0, 208, 233, 0.1)',
              border: '1px solid rgba(0, 208, 233, 0.2)',
              borderRadius: 4,
              padding: '4px 6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {leftCollapsed ? <PanelLeftOpen size={14} color="#00D0E9" /> : <PanelLeftClose size={14} color="#00D0E9" />}
          </button>
        )}
        <span className="module-title">GIS地图</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {deviceTypes.map((dt) => (
            <button
              key={dt.id}
              onClick={() => onFilterChange(dt.id)}
              aria-label={`筛选${dt.label}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                background: activeFilter === dt.id ? `${dt.color}20` : 'transparent',
                border: `1px solid ${activeFilter === dt.id ? `${dt.color}60` : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                color: activeFilter === dt.id ? dt.color : '#A0A8B4',
                whiteSpace: 'nowrap',
                transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (activeFilter !== dt.id) {
                  e.currentTarget.style.background = `${dt.color}10`;
                  e.currentTarget.style.borderColor = `${dt.color}40`;
                  e.currentTarget.style.color = dt.color;
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== dt.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#A0A8B4';
                }
              }}
            >
              {dt.id !== 'all' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dt.color, display: 'inline-block' }} />}
              {dt.label}
            </button>
          ))}
        </div>
        {/* 无人机启动按钮 */}
        <button
          onClick={onDronesToggle}
          aria-label={dronesActive ? '关闭无人机' : '启动无人机'}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 10px',
            background: dronesActive ? 'rgba(46,213,115,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${dronesActive ? 'rgba(46,213,115,0.4)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 4, cursor: 'pointer', fontSize: 11,
            color: dronesActive ? '#2ED573' : '#A0A8B4',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: dronesActive ? '#2ED573' : '#4B5563', transition: 'background 0.2s' }} />
          {dronesActive ? '无人机巡航中' : '启动无人机'}
        </button>
        <div className="module-icon">
          <Map size={16} />
        </div>
        {onToggleRight && (
          <button
            onClick={onToggleRight}
            title={rightCollapsed ? '展开右侧面板' : '收起右侧面板'}
            aria-label={rightCollapsed ? '展开右侧面板' : '收起右侧面板'}
            style={{
              background: 'rgba(0, 208, 233, 0.1)',
              border: '1px solid rgba(0, 208, 233, 0.2)',
              borderRadius: 4,
              padding: '4px 6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {rightCollapsed ? <PanelRightOpen size={14} color="#00D0E9" /> : <PanelRightClose size={14} color="#00D0E9" />}
          </button>
        )}
      </div>
    </div>
  );
}

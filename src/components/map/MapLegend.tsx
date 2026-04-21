import { useUIStore } from '../../stores/uiStore';

/**
 * 地图图例组件
 * - 显示所有设备类型
 * - 点击切换单独展示某一种设备
 * - 再次点击恢复显示全部
 */

const DEVICE_TYPES = [
  { key: 'electronicPolice', label: '电子警察', color: '#f87171' },
  { key: 'parkingViolation', label: '违停抓拍', color: '#fbbf24' },
  { key: 'speedCamera', label: '超速抓拍', color: '#fb923c' },
  { key: 'securityCamera', label: '治安监控', color: '#60a5fa' },
  { key: 'checkpointGate', label: '治安卡口', color: '#60a5fa' },
  { key: 'trafficLight', label: '信号灯', color: '#34d399' },
  { key: 'infoScreen', label: '信息发布屏', color: '#4da6ff' },
  { key: 'drone', label: '无人机', color: '#2dd4bf' },
];

export default function MapLegend() {
  const systemMode = useUIStore((s) => s.systemMode);
  const deviceFilter = useUIStore((s) => s.deviceFilter);
  const setDeviceFilter = useUIStore((s) => s.setDeviceFilter);
  const isOverview = systemMode === 'overview';

  const handleClick = (key: string) => {
    if (deviceFilter === key) {
      setDeviceFilter(null); // 取消过滤，显示全部
    } else {
      setDeviceFilter(key); // 只显示该类型
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: isOverview ? '62px' : '16px',
        right: isOverview ? '376px' : '16px',
        background: 'rgba(6, 13, 26, 0.92)',
        border: '1px solid rgba(77, 166, 255, 0.24)',
        borderRadius: '6px',
        padding: '8px',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        minWidth: '136px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.24)',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#c8dcff',
          marginBottom: '6px',
          fontFamily: 'Noto Sans SC, sans-serif',
        }}
      >
        设备图例
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {DEVICE_TYPES.map((type) => {
          const isActive = deviceFilter === null || deviceFilter === type.key;
          const isSelected = deviceFilter === type.key;

          return (
            <button
              key={type.key}
              onClick={() => handleClick(type.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 7px',
                background: isSelected
                  ? 'rgba(77, 166, 255, 0.2)'
                  : isActive
                  ? 'rgba(77, 166, 255, 0.05)'
                  : 'rgba(107, 114, 128, 0.1)',
                border: isSelected
                  ? '1px solid rgba(77, 166, 255, 0.5)'
                  : '1px solid transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: isActive ? 1 : 0.4,
                fontFamily: 'Noto Sans SC, sans-serif',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(77, 166, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = isActive
                    ? 'rgba(77, 166, 255, 0.05)'
                    : 'rgba(107, 114, 128, 0.1)';
                }
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: type.color,
                  boxShadow: `0 0 6px ${type.color}`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '10px',
                  color: isActive ? '#c8dcff' : '#6b7280',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {type.label}
              </span>
            </button>
          );
        })}
      </div>
      {deviceFilter && (
        <button
          onClick={() => setDeviceFilter(null)}
          style={{
            marginTop: '6px',
            width: '100%',
            padding: '4px',
            background: 'rgba(77, 166, 255, 0.15)',
            border: '1px solid rgba(77, 166, 255, 0.3)',
            borderRadius: '4px',
            color: '#4da6ff',
            fontSize: '10px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'Noto Sans SC, sans-serif',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(77, 166, 255, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(77, 166, 255, 0.15)';
          }}
        >
          显示全部设备
        </button>
      )}
    </div>
  );
}

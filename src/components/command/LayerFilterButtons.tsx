import { Layers, MapPin, Users, Wrench, Route, Truck } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';

export default function LayerFilterButtons() {
  const mapLayers = useCommandStore((s) => s.commandState.mapLayers);
  const toggleMapLayer = useCommandStore((s) => s.toggleMapLayer);
  const setAllMapLayers = useCommandStore((s) => s.setAllMapLayers);

  const allActive = Object.values(mapLayers).every(Boolean);

  const layers = [
    { key: 'congestion' as const, label: '拥堵路段', icon: MapPin },
    { key: 'personnel' as const, label: '执行人员', icon: Users },
    { key: 'equipment' as const, label: '设备点位', icon: Wrench },
    { key: 'routes' as const, label: '分流路线', icon: Route },
    { key: 'vehicles' as const, label: '特殊车辆', icon: Truck },
  ];

  const buttonBase = {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 8,
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer' as const,
    transition: 'all 0.2s ease',
    outline: 'none' as const,
    whiteSpace: 'nowrap' as const,
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: 'rgba(10, 15, 25, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0, 208, 233, 0.2)',
        borderRadius: 8,
        padding: 8,
      }}
    >
      {/* "All" toggle button */}
      <button
        onClick={() => setAllMapLayers(!allActive)}
        style={{
          ...buttonBase,
          background: allActive
            ? 'rgba(0, 208, 233, 0.15)'
            : 'rgba(148, 163, 184, 0.08)',
          border: allActive
            ? '1px solid rgba(0, 208, 233, 0.5)'
            : '1px solid rgba(148, 163, 184, 0.2)',
          color: allActive ? '#00D0E9' : '#94A3B8',
          marginBottom: 2,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = allActive
            ? 'rgba(0, 208, 233, 0.25)'
            : 'rgba(148, 163, 184, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = allActive
            ? 'rgba(0, 208, 233, 0.15)'
            : 'rgba(148, 163, 184, 0.08)';
        }}
      >
        <Layers size={14} />
        <span>全部</span>
      </button>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(148, 163, 184, 0.15)', margin: '0 4px' }} />

      {/* Individual layer toggles */}
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isActive = mapLayers[layer.key];

        return (
          <button
            key={layer.key}
            onClick={() => toggleMapLayer(layer.key)}
            style={{
              ...buttonBase,
              background: isActive
                ? 'rgba(0, 208, 233, 0.15)'
                : 'rgba(148, 163, 184, 0.08)',
              border: isActive
                ? '1px solid rgba(0, 208, 233, 0.5)'
                : '1px solid rgba(148, 163, 184, 0.2)',
              color: isActive ? '#00D0E9' : '#94A3B8',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isActive
                ? 'rgba(0, 208, 233, 0.25)'
                : 'rgba(148, 163, 184, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isActive
                ? 'rgba(0, 208, 233, 0.15)'
                : 'rgba(148, 163, 184, 0.08)';
            }}
          >
            <Icon size={14} />
            <span>{layer.label}</span>
          </button>
        );
      })}
    </div>
  );
}

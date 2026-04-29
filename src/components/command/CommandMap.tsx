import { useRef } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useCommandMap } from '../../hooks/useCommandMap';
import CommandMapLegend from './CommandMapLegend';
import LayerFilterButtons from './LayerFilterButtons';
import './command-map.css';

export default function CommandMap() {
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleNodeClick = (id: string) => {
    if (id === 'xuwen-port') {
      setActiveModal('congestion-detail');
    }
  };

  const { mapReady, mapError } = useCommandMap(mapRef, handleNodeClick);

  return (
    <div className="module-card" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      />
      {!mapReady && !mapError && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10,15,25,0.9)',
          color: '#00D0E9', fontSize: 14,
        }}>
          <span>地图加载中...</span>
        </div>
      )}
      {mapError && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10,15,25,0.95)',
          color: '#FF4757', fontSize: 13, gap: 8,
        }}>
          <span>地图加载失败</span>
          <span style={{ color: '#94A3B8', fontSize: 11 }}>{mapError}</span>
        </div>
      )}
      {mapReady && (
        <>
          <LayerFilterButtons />
          <CommandMapLegend />
        </>
      )}
    </div>
  );
}

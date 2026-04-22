import { useRef } from 'react';
import { useEmergencyMap } from '../../hooks/useEmergencyMap';
import EmergencyMapLegend from './EmergencyMapLegend';
import './emergency-map.css';

export default function EmergencyMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { mapReady, mapError } = useEmergencyMap(mapRef);

  return (
    <div className="card" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      />
      {!mapReady && !mapError && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10,15,25,0.9)',
          color: '#FF4757', fontSize: 14,
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
      {mapReady && <EmergencyMapLegend />}
    </div>
  );
}

// 琼州海峡示意图主容器
import { SVG_WIDTH, SVG_HEIGHT } from './hooks/useCoordinateMap';
import SeaBackground from './layers/SeaBackground';
import Coastlines from './layers/Coastlines';
import PortStructures from './layers/PortStructures';
import ShippingLanes from './layers/ShippingLanes';
import VesselRenderer from './layers/VesselRenderer';

export default function StraitSchematicMap() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'rgba(0,20,40,0.85)',
        border: '1px solid rgba(0,208,233,0.2)',
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        {/* L0-L3: 海面背景 */}
        <SeaBackground />

        {/* L4: 海岸线 */}
        <Coastlines />

        {/* L5-L6: 港口标记 */}
        <PortStructures />

        {/* L7-L8: 航线 */}
        <ShippingLanes />

        {/* L9-L11: 船舶 */}
        <VesselRenderer />
      </svg>

      {/* 图例（右上角） */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'rgba(10,14,39,0.9)',
          border: '1px solid rgba(0,208,233,0.2)',
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 10,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        <div style={{ marginBottom: 6, fontWeight: 600, color: '#00D0E9' }}>图例</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D0E9' }} />
          <span>徐闻侧港口</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F5A623' }} />
          <span>海南侧港口</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 2, background: '#00D0E9' }} />
          <span>航线</span>
        </div>
      </div>
    </div>
  );
}

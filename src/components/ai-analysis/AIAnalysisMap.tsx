import { useEffect, useRef, useState } from 'react';
import { loadAMap } from '../../utils/amapLoader';
import { Layers } from 'lucide-react';

export default function AIAnalysisMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);

  useEffect(() => {
    let destroyed = false;
    let heatmapLayer: any = null;
    let trafficLayer: any = null;

    loadAMap(['AMap.HeatMap']).then((AMap: any) => {
      if (destroyed || !mapRef.current) return;

      const map = new AMap.Map(mapRef.current, {
        zoom: 12,
        center: [110.150, 20.270],
        mapStyle: 'amap://styles/dark',
        viewMode: '2D',
        features: ['bg', 'road'],
      });

      // 深色背景叠加
      if (mapRef.current) {
        mapRef.current.style.background = '#0A1929';
      }

      mapInstance.current = map;

      // 实时路况图层
      trafficLayer = new AMap.TileLayer.Traffic({
        zIndex: 10,
        autoRefresh: true,
        interval: 30,
      });
      map.add(trafficLayer);

      // 热力图图层（拥堵热力）
      const heatmapData = [
        { lng: 110.150, lat: 20.270, count: 85 },
        { lng: 110.155, lat: 20.275, count: 92 },
        { lng: 110.145, lat: 20.265, count: 78 },
        { lng: 110.160, lat: 20.280, count: 88 },
        { lng: 110.140, lat: 20.260, count: 65 },
      ];

      heatmapLayer = new AMap.HeatMap(map, {
        radius: 30,
        opacity: [0, 0.8],
        gradient: {
          0.4: '#34D399',
          0.6: '#FBBF24',
          0.8: '#FB923C',
          1.0: '#F87171',
        },
      });
      heatmapLayer.setDataSet({ data: heatmapData, max: 100 });
    }).catch(() => {
      // Map loading failed
    });

    return () => {
      destroyed = true;
      if (heatmapLayer) heatmapLayer.hide();
      if (trafficLayer) trafficLayer.hide();
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="ai-analysis-map">
      <div ref={mapRef} className="ai-analysis-map__container" />

      {/* 图层控制 */}
      <div className="ai-analysis-map__controls">
        <button
          className={`map-control-btn ${showHeatmap ? 'active' : ''}`}
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          <Layers size={14} />
          <span>热力图</span>
        </button>
        <button
          className={`map-control-btn ${showRiskZones ? 'active' : ''}`}
          onClick={() => setShowRiskZones(!showRiskZones)}
        >
          <Layers size={14} />
          <span>风险区域</span>
        </button>
      </div>

      {/* AI分析标注 */}
      <div className="ai-analysis-map__badge">
        <span>AI分析图层</span>
        <em>实时更新</em>
      </div>
    </div>
  );
}

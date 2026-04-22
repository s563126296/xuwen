import { useEffect, useRef, useState } from 'react';
import { BrainCircuit, Layers, Route } from 'lucide-react';
import { loadAMap } from '../../utils/amapLoader';

type SemanticOverlayGroups = {
  heat: any[];
  flows: any[];
  labels: any[];
  cards: any[];
  connectors: any[];
};

const heatAreas = [
  {
    id: 'port',
    name: '港口积压',
    value: '2847辆',
    center: [110.096, 20.226],
    radius: 2300,
    fill: '#f5a623',
    stroke: '#f5a623',
  },
  {
    id: 'road',
    name: '进港大道',
    value: '3.2km',
    center: [110.152, 20.260],
    radius: 2800,
    fill: '#ff4757',
    stroke: '#ff4757',
  },
  {
    id: 'city',
    name: '城区承压',
    value: '指数65',
    center: [110.183, 20.322],
    radius: 2100,
    fill: '#7C5CFC',
    stroke: '#7C5CFC',
  },
];

const flowLines = [
  {
    id: 'pressure',
    path: [
      [110.096, 20.226],
      [110.124, 20.244],
      [110.152, 20.260],
      [110.183, 20.322],
    ],
    color: '#ff4757',
    width: 7,
  },
  {
    id: 'suggestion',
    path: [
      [110.103, 20.206],
      [110.143, 20.218],
      [110.193, 20.245],
      [110.225, 20.286],
    ],
    color: '#2ed573',
    width: 5,
  },
];

const insightCards = [
  {
    id: 'cause',
    label: '主因识别',
    value: '港口放行',
    detail: '贡献度68% · 影响进港大道',
    position: [110.132, 20.238],
    tone: 'primary',
  },
  {
    id: 'lag',
    label: '传导时滞',
    value: '15-25分钟',
    detail: '港口波次传至城区',
    position: [110.185, 20.346],
    tone: 'warning',
  },
  {
    id: 'peak',
    label: '45分钟预测',
    value: '指数2.45',
    detail: '峰值仍在上行',
    position: [110.174, 20.282],
    tone: 'danger',
  },
  {
    id: 'action',
    label: '策略建议',
    value: '启动S376分流',
    detail: '预计主通道下降0.6-0.8',
    position: [110.212, 20.226],
    tone: 'success',
  },
];

function setVisible(overlays: any[], visible: boolean) {
  overlays.forEach((overlay) => {
    if (visible) overlay.show?.();
    else overlay.hide?.();
  });
}

function createHeatLabel(area: typeof heatAreas[number]) {
  return `
    <div class="amap-twin-label amap-twin-label--${area.id}">
      <span>${area.name}</span>
      <strong>${area.value}</strong>
    </div>
  `;
}

function createInsightCard(card: typeof insightCards[number]) {
  return `
    <div class="amap-twin-card amap-twin-card--${card.tone}">
      <span class="amap-twin-card__icon"></span>
      <span>${card.label}</span>
      <strong>${card.value}</strong>
      <em>${card.detail}</em>
    </div>
  `;
}

function createConnector(
  cardPosition: [number, number],
  heatCenter: [number, number],
  tone: string
) {
  const colorMap: Record<string, string> = {
    primary: '#00D0E9',
    warning: '#F5A623',
    danger: '#FF4757',
    success: '#2ED573'
  };

  return {
    path: [cardPosition, heatCenter],
    color: colorMap[tone] || '#00D0E9',
  };
}

export default function AIAnalysisMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const heatmapLayerRef = useRef<any>(null);
  const semanticOverlaysRef = useRef<SemanticOverlayGroups>({ heat: [], flows: [], labels: [], cards: [], connectors: [] });
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showAnalysisCards, setShowAnalysisCards] = useState(true);
  const [showTrafficFlow, setShowTrafficFlow] = useState(true);
  const visibilityRef = useRef({ showHeatmap: true, showAnalysisCards: true, showTrafficFlow: true });

  useEffect(() => {
    visibilityRef.current = { showHeatmap, showAnalysisCards, showTrafficFlow };
  }, [showHeatmap, showAnalysisCards, showTrafficFlow]);

  useEffect(() => {
    let destroyed = false;
    let breatheInterval: NodeJS.Timeout | null = null;

    loadAMap(['AMap.HeatMap']).then((AMap: any) => {
      if (destroyed || !mapRef.current) return;

      const map = new AMap.Map(mapRef.current, {
        zoom: 12,
        center: [110.150, 20.270],
        mapStyle: 'amap://styles/dark',
        viewMode: '2D',
        features: ['bg'],
      });

      if (mapRef.current) {
        mapRef.current.style.background = '#0A1929';
      }

      mapInstance.current = map;

      const heatmapData = [
        { lng: 110.096, lat: 20.226, count: 92 },
        { lng: 110.112, lat: 20.238, count: 78 },
        { lng: 110.152, lat: 20.260, count: 100 },
        { lng: 110.166, lat: 20.276, count: 86 },
        { lng: 110.183, lat: 20.322, count: 65 },
        { lng: 110.196, lat: 20.304, count: 58 },
      ];

      heatmapLayerRef.current = new AMap.HeatMap(map, {
        radius: 34,
        opacity: [0, 0.72],
        gradient: {
          0.35: '#2ED573',
          0.58: '#F5A623',
          0.78: '#FF7A45',
          1.0: '#FF4757',
        },
      });
      heatmapLayerRef.current.setDataSet({ data: heatmapData, max: 100 });

      const heat = heatAreas.map((area) => new AMap.Circle({
        center: area.center,
        radius: area.radius,
        strokeColor: area.stroke,
        strokeWeight: 1,
        strokeOpacity: 0.35,
        fillColor: area.fill,
        fillOpacity: 0.15,
        zIndex: 41,
        bubble: true,
      }));

      const flows = flowLines.map((flow) => new AMap.Polyline({
        path: flow.path,
        strokeColor: flow.color,
        strokeOpacity: 0.78,
        strokeWeight: flow.width,
        strokeStyle: 'dashed',
        strokeDasharray: [12, 6],
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 45,
        bubble: true,
      }));

      const labels = heatAreas.map((area) => new AMap.Marker({
        position: area.center,
        content: createHeatLabel(area),
        offset: new AMap.Pixel(-54, -14),
        zIndex: 60,
        bubble: true,
      }));

      const cards = insightCards.map((card) => new AMap.Marker({
        position: card.position,
        content: createInsightCard(card),
        offset: new AMap.Pixel(-74, -38),
        zIndex: 70,
        bubble: true,
      }));

      const connectors = insightCards.map((card, index) => {
        const targetArea = heatAreas[index % heatAreas.length];
        const connectorData = createConnector(card.position, targetArea.center, card.tone);

        return new AMap.Polyline({
          path: connectorData.path,
          strokeColor: connectorData.color,
          strokeOpacity: 0.35,
          strokeWeight: 1,
          strokeStyle: 'dashed',
          strokeDasharray: [8, 4],
          lineJoin: 'round',
          zIndex: 40,
          bubble: true,
        });
      });

      semanticOverlaysRef.current = { heat, flows, labels, cards, connectors };
      map.add([...heat, ...flows, ...connectors, ...labels, ...cards]);
      setVisible(heat, visibilityRef.current.showHeatmap);
      setVisible(flows, visibilityRef.current.showTrafficFlow);
      setVisible([...connectors, ...labels, ...cards], visibilityRef.current.showAnalysisCards);

      // 热力图呼吸动画
      let phase = 0;
      breatheInterval = setInterval(() => {
        if (!semanticOverlaysRef.current.heat.length) return;
        phase += 0.03;
        const opacity = 0.15 + Math.sin(phase) * 0.05; // 0.10 ~ 0.20
        semanticOverlaysRef.current.heat.forEach(circle => {
          circle.setOptions({ fillOpacity: opacity });
        });
      }, 60);
    }).catch(() => {
      // Map loading failed
    });

    return () => {
      destroyed = true;
      if (breatheInterval) clearInterval(breatheInterval);
      const overlays = Object.values(semanticOverlaysRef.current).flat();
      if (mapInstance.current && overlays.length) {
        mapInstance.current.remove(overlays);
      }
      if (heatmapLayerRef.current) heatmapLayerRef.current.hide();
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
      heatmapLayerRef.current = null;
      semanticOverlaysRef.current = { heat: [], flows: [], labels: [], cards: [], connectors: [] };
    };
  }, []);

  useEffect(() => {
    if (heatmapLayerRef.current) {
      if (showHeatmap) heatmapLayerRef.current.show();
      else heatmapLayerRef.current.hide();
    }
    setVisible(semanticOverlaysRef.current.heat, showHeatmap);
  }, [showHeatmap]);

  useEffect(() => {
    setVisible(semanticOverlaysRef.current.flows, showTrafficFlow);
  }, [showTrafficFlow]);

  useEffect(() => {
    setVisible([...semanticOverlaysRef.current.connectors, ...semanticOverlaysRef.current.labels, ...semanticOverlaysRef.current.cards], showAnalysisCards);
  }, [showAnalysisCards]);

  return (
    <div className="ai-analysis-map">
      <div ref={mapRef} className="ai-analysis-map__container" />

      <div className="ai-analysis-map__scan" />

      <div className="ai-analysis-map__controls">
        <button
          className={`map-control-btn ${showHeatmap ? 'active' : ''}`}
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          <Layers size={14} />
          <span>热力区</span>
        </button>
        <button
          className={`map-control-btn ${showTrafficFlow ? 'active' : ''}`}
          onClick={() => setShowTrafficFlow(!showTrafficFlow)}
        >
          <Route size={14} />
          <span>传导线</span>
        </button>
        <button
          className={`map-control-btn ${showAnalysisCards ? 'active' : ''}`}
          onClick={() => setShowAnalysisCards(!showAnalysisCards)}
        >
          <BrainCircuit size={14} />
          <span>分析卡</span>
        </button>
      </div>

      <div className="ai-analysis-map__badge">
        <span>AI热力研判图</span>
        <em>地图原生覆盖物 · 跟随缩放拖动</em>
      </div>

      <div className="ai-analysis-map__legend">
        <span><i className="legend-dot legend-dot--danger" />问题热区</span>
        <span><i className="legend-dot legend-dot--warning" />风险热区</span>
        <span><i className="legend-dot legend-dot--prediction" />预测热区</span>
        <span><i className="legend-dot legend-dot--success" />AI建议</span>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { MapSceneContext } from '../map/MapSceneContext';
import { mapPointToGcj } from '../../utils/coordTransform';
import ShippingLaneLayer from '../map/layers/ShippingLaneLayer';
import FerryLayer from '../map/layers/FerryLayer';
import PortLabelAndBuildingLayer from '../map/layers/PortLabelAndBuildingLayer';
import PortVesselLayer from './layers/PortVesselLayer';
import PortFlowOverlay from './layers/PortFlowOverlay';
import PortStraitOverlay from './layers/PortStraitOverlay';
import PortRoadLayer from './layers/PortRoadLayer';
import PortBuildingLayer from './layers/PortBuildingLayer';
import PortCameraLayer from './layers/PortCameraLayer';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY;

if (import.meta.env.VITE_AMAP_SECURITY_JS_CODE) {
  (window as any)._AMapSecurityConfig = {
    securityJsCode: import.meta.env.VITE_AMAP_SECURITY_JS_CODE,
  };
}

// 海峡中心坐标
const PORT_CENTER: [number, number] = [110.16, 20.14];

export default function PortRealMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || sceneRef.current || !AMAP_KEY) return;

    const gcjCenter = mapPointToGcj(PORT_CENTER);
    const scene = new Scene({
      id: containerRef.current,
      map: new GaodeMap({
        center: gcjCenter,
        zoom: 10.2,
        pitch: 35,
        rotation: 0,
        style: 'amap://styles/darkblue',
        token: AMAP_KEY,
        viewMode: '3D',
        features: ['bg', 'road', 'building'],
      }),
    });

    scene.on('loaded', () => {
      sceneRef.current = scene;
      setReady(true);
    });

    return () => {
      scene.destroy();
      sceneRef.current = null;
      setReady(false);
    };
  }, []);

  if (!AMAP_KEY) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07111F', color: '#00D0E9', fontSize: 13 }}>
        需要配置 VITE_AMAP_KEY 才能加载地图
      </div>
    );
  }

  return (
    <MapSceneContext.Provider value={ready ? sceneRef.current : null}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
      {ready && (
        <>
          <PortBuildingLayer />
          <PortRoadLayer />
          <ShippingLaneLayer />
          <FerryLayer />
          <PortLabelAndBuildingLayer visible />
          <PortCameraLayer />
          <PortVesselLayer />
          <PortFlowOverlay />
          <PortStraitOverlay />
        </>
      )}
    </MapSceneContext.Provider>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { MapSceneContext } from './MapSceneContext';
import { mapPointToGcj } from '../../utils/coordTransform';
import LayerController from './LayerController';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY;

// 高德地图 2.0 安全密钥配置
if (import.meta.env.VITE_AMAP_SECURITY_JS_CODE) {
  (window as any)._AMapSecurityConfig = {
    securityJsCode: import.meta.env.VITE_AMAP_SECURITY_JS_CODE,
  };
}

// 徐闻县中心坐标 (WGS84)
const MAP_CENTER: [number, number] = [110.134812, 20.232438];
const MAP_DEFAULT_ZOOM = 11;
const MAP_DEFAULT_PITCH = 45;
const MAP_DEFAULT_ROTATION = -10;

interface Viewport {
  center: [number, number];
  zoom: number;
  pitch?: number;
  rotation?: number;
}

export default function MapContainer({ children }: { children?: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const [ready, setReady] = useState(false);
  const [_viewport, setViewport] = useState<Viewport>({
    center: MAP_CENTER,
    zoom: MAP_DEFAULT_ZOOM,
    pitch: MAP_DEFAULT_PITCH,
    rotation: MAP_DEFAULT_ROTATION,
  });

  // 初始化 Scene
  useEffect(() => {
    if (!containerRef.current || sceneRef.current) return;

    const gcjCenter = mapPointToGcj(MAP_CENTER);
    const scene = new Scene({
      id: containerRef.current,
      map: new GaodeMap({
        center: gcjCenter,
        zoom: MAP_DEFAULT_ZOOM,
        pitch: MAP_DEFAULT_PITCH,
        rotation: MAP_DEFAULT_ROTATION,
        style: 'amap://styles/darkblue',
        token: AMAP_KEY || '',
        viewMode: '3D',
      }),
    });

    scene.on('loaded', () => {
      sceneRef.current = scene;
      setReady(true);

      // 监听缩放变化
      scene.on('zoomend', () => {
        const zoom = scene.getZoom();
        const center = scene.getCenter();
        const pitch = scene.getPitch();
        const rotation = scene.getRotation();
        setViewport({
          center: [center.lng, center.lat],
          zoom,
          pitch,
          rotation,
        });
      });

      // 监听移动结束
      scene.on('moveend', () => {
        const zoom = scene.getZoom();
        const center = scene.getCenter();
        setViewport((prev) => ({
          ...prev,
          center: [center.lng, center.lat],
          zoom,
        }));
      });
    });

    return () => {
      scene.destroy();
      sceneRef.current = null;
      setReady(false);
    };
  }, []);

  if (!AMAP_KEY) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: '#0A0F19' }}
      >
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          maxWidth: '28rem',
          background: 'rgba(0, 208, 233, 0.05)',
          border: '1px solid rgba(0, 208, 233, 0.2)',
          borderRadius: '0.5rem',
        }}>
          <div style={{
            fontSize: '0.875rem',
            letterSpacing: '0.05em',
            color: '#00D0E9',
            marginBottom: '0.75rem',
            fontWeight: 600,
          }}>
            MAP KEY REQUIRED
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '1rem',
          }}>
            需要高德地图 API Key 才能加载地图。
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'left',
          }}>
            <div>1. 访问 <span style={{ color: '#00D0E9' }}>https://lbs.amap.com/</span> 注册</div>
            <div>2. 创建 Web JS API 应用</div>
            <div>3. 在项目根目录创建 <span style={{ color: '#fff' }}>.env.local</span> 文件</div>
            <div>4. 添加: <span style={{ color: '#fff' }}>VITE_AMAP_KEY=your_key</span></div>
            <div>5. 添加: <span style={{ color: '#fff' }}>VITE_AMAP_SECURITY_JS_CODE=your_security_code</span></div>
            <div>6. 重启开发服务器</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MapSceneContext.Provider value={ready ? sceneRef.current : null}>
      <div ref={containerRef} className="fixed inset-0" style={{ zIndex: 0 }} />
      {ready && (
        <>
          <LayerController />
          {children}
        </>
      )}
    </MapSceneContext.Provider>
  );
}

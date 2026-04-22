/**
 * 高德地图 API 全局单例加载器
 * 确保整个应用只加载一次高德地图 API，避免"多个不一致的 key"错误
 */

import AMapLoader from '@amap/amap-jsapi-loader';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || '87e4e2fcaa3bd6c3f0a858281bf246cd';
const AMAP_VERSION = '2.0';

let loadPromise: Promise<any> | null = null;

/**
 * 加载高德地图 API（全局单例）
 * @param plugins 需要加载的插件列表
 * @returns Promise<AMap>
 */
export function loadAMap(plugins: string[] = ['AMap.Scale']): Promise<any> {
  // 设置安全密钥（高德地图 2.0 必需）
  if (import.meta.env.VITE_AMAP_SECURITY_JS_CODE && !(window as any)._AMapSecurityConfig) {
    (window as any)._AMapSecurityConfig = {
      securityJsCode: import.meta.env.VITE_AMAP_SECURITY_JS_CODE,
    };
    console.log('[amapLoader] Security config set');
  }

  // 如果已经加载过，直接返回 window.AMap
  if ((window as any).AMap) {
    console.log('[amapLoader] AMap already loaded, returning existing instance');
    return Promise.resolve((window as any).AMap);
  }

  // 如果正在加载，返回现有的 Promise
  if (loadPromise) {
    console.log('[amapLoader] AMap loading in progress, returning existing promise');
    return loadPromise;
  }

  // 开始加载
  console.log('[amapLoader] Loading AMap with key:', AMAP_KEY.slice(0, 8) + '...', 'plugins:', plugins);
  loadPromise = AMapLoader.load({
    key: AMAP_KEY,
    version: AMAP_VERSION,
    plugins,
  }).then((AMap: any) => {
    console.log('[amapLoader] AMap loaded successfully');
    return AMap;
  }).catch((err: any) => {
    console.error('[amapLoader] AMap load failed:', err);
    loadPromise = null; // 重置，允许重试
    throw err;
  });

  return loadPromise;
}

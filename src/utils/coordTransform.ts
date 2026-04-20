/**
 * WGS84 → GCJ-02 坐标转换
 * 高德地图使用 GCJ-02 坐标系，L7 数据源保持 WGS84，渲染前批量转换。
 * 算法参考：https://github.com/wandergis/coordtransform
 */

const PI = Math.PI;
const A = 6378245.0; // 长半轴
const EE = 0.00669342162296594323; // 扁率

function outOfChina(lng: number, lat: number): boolean {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(lng: number, lat: number): number {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng(lng: number, lat: number): number {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}

/** 单点 WGS84 → GCJ-02 */
export function wgs84ToGcj02(lng: number, lat: number): [number, number] {
  if (outOfChina(lng, lat)) return [lng, lat];

  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);

  return [lng + dLng, lat + dLat];
}

function isValidLngLat(point: number[]): boolean {
  return (
    Array.isArray(point) &&
    point.length >= 2 &&
    Number.isFinite(point[0]) &&
    Number.isFinite(point[1]) &&
    point[0] >= -180 && point[0] <= 180 &&
    point[1] >= -90 && point[1] <= 90
  );
}

/** 递归转换坐标数组（LineString / Polygon 的 coordinates） */
function mapCoordsToGcj(coordinates: any): any {
  if (!Array.isArray(coordinates)) return coordinates;
  if (isValidLngLat(coordinates)) {
    return wgs84ToGcj02(coordinates[0], coordinates[1]);
  }
  return coordinates.map(mapCoordsToGcj);
}

/** GeoJSON FeatureCollection → GCJ-02 */
export function mapFeatureCollectionToGcj<T extends { type: string; features: any[] }>(collection: T): T {
  if (!collection || !Array.isArray(collection.features)) return collection;
  return {
    ...collection,
    features: collection.features.map((f: any) => ({
      ...f,
      geometry: f.geometry
        ? { ...f.geometry, coordinates: mapCoordsToGcj(f.geometry.coordinates) }
        : f.geometry,
    })),
  };
}

/** 行数据（lng/lat 字段）→ GCJ-02 */
export function mapRowsToGcj<T extends { lng: number; lat: number }>(rows: T[]): T[] {
  return rows.map((item) => {
    if (!Number.isFinite(item.lng) || !Number.isFinite(item.lat)) return item;
    const [lng, lat] = wgs84ToGcj02(item.lng, item.lat);
    return { ...item, lng, lat };
  });
}

/** 坐标对 [lng, lat] → GCJ-02 */
export function mapPointToGcj(point: [number, number]): [number, number] {
  if (!isValidLngLat(point)) return point;
  return wgs84ToGcj02(point[0], point[1]);
}

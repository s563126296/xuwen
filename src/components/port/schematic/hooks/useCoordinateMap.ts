// 琼州海峡 SVG 坐标映射
// 真实经纬度范围 → SVG viewBox 坐标

// 经纬度范围（覆盖所有港口和航线）
const LNG_MIN = 109.98;
const LNG_MAX = 110.32;
const LAT_MIN = 19.94;
const LAT_MAX = 20.30;

// SVG viewBox 尺寸
export const SVG_WIDTH = 1200;
export const SVG_HEIGHT = 700;

// 徐闻侧占上方 60-70%，通过调整 LAT 映射实现
// 海峡中线约 lat 20.15，徐闻侧 20.15-20.30，海南侧 19.94-20.15
// 让徐闻侧映射到 y=0~420（60%），海南侧映射到 y=420~700（40%）

export function lngToX(lng: number): number {
  return ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * SVG_WIDTH;
}

export function latToY(lat: number): number {
  // 非线性映射：徐闻侧（高纬度）占更多空间
  const midLat = 20.15;
  const midY = 420; // 海峡中线在 SVG 的 y=420 位置

  if (lat >= midLat) {
    // 徐闻侧：lat 20.15~20.30 → y 420~0
    const ratio = (lat - midLat) / (LAT_MAX - midLat);
    return midY - ratio * midY;
  } else {
    // 海南侧：lat 19.94~20.15 → y 420~700
    const ratio = (midLat - lat) / (midLat - LAT_MIN);
    return midY + ratio * (SVG_HEIGHT - midY);
  }
}

export function geoToSvg(lng: number, lat: number): [number, number] {
  return [lngToX(lng), latToY(lat)];
}

// 港口坐标（来自 keyPois.json）
export const PORT_POSITIONS = {
  xuwen: { lng: 110.134812, lat: 20.232438, name: '徐闻港' },
  haianNew: { lng: 110.212396, lat: 20.268227, name: '海安新港' },
  haian: { lng: 110.230557, lat: 20.269242, name: '海安港' },
  yuehai: { lng: 110.12585, lat: 20.229559, name: '粤海铁路北港' },
  xinhai: { lng: 110.1502, lat: 20.0537, name: '海口新海港' },
  xiuying: { lng: 110.2807, lat: 20.0234, name: '海口秀英港' },
  nangang: { lng: 110.1506, lat: 20.0421, name: '海口南港码头' },
  macun: { lng: 110.0098, lat: 19.9593, name: '马村港' },
} as const;

// 航线数据（简化的关键点，用于 SVG path）
export const LANE_COLORS = {
  primary: '#00D0E9',
  secondary: 'rgba(0,208,233,0.6)',
} as const;

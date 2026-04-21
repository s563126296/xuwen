import { useEffect, useRef } from 'react';
import { PolygonLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../../../MapSceneContext';
import { wgs84ToGcj02 } from '../../../../../utils/coordTransform';

export interface CoveragePoint {
  lng: number;
  lat: number;
  id: string;
  /** Radius in meters */
  radius: number;
  /** Bearing in degrees (sector center direction, 0 = north) */
  bearing?: number;
  /** Sector angle in degrees (spread from bearing) */
  angle?: number;
  [key: string]: unknown;
}

export interface CoverageAreaLayerProps {
  /** Shape type for coverage visualization */
  shapeType: 'sector' | 'circle' | 'rect';
  /** Coverage point data (WGS84 coordinates) */
  points: CoveragePoint[];
  /** Fill color */
  fillColor?: string;
  /** Fill opacity */
  opacity?: number;
  /** Layer z-index */
  zIndex?: number;
}

// ── Geometry generators (pure math, no turf dependency) ─────────────────

const DEG2RAD = Math.PI / 180;
const EARTH_RADIUS = 6378137; // meters

/** Offset a point by distance (m) and bearing (deg, 0=north clockwise) */
function offsetPoint(lng: number, lat: number, distance: number, bearing: number): [number, number] {
  const angDist = distance / EARTH_RADIUS;
  const bearRad = bearing * DEG2RAD;
  const latRad = lat * DEG2RAD;
  const lngRad = lng * DEG2RAD;

  const newLat = Math.asin(
    Math.sin(latRad) * Math.cos(angDist) +
    Math.cos(latRad) * Math.sin(angDist) * Math.cos(bearRad),
  );
  const newLng = lngRad + Math.atan2(
    Math.sin(bearRad) * Math.sin(angDist) * Math.cos(latRad),
    Math.cos(angDist) - Math.sin(latRad) * Math.sin(newLat),
  );

  return [newLng / DEG2RAD, newLat / DEG2RAD];
}

/** Generate a circle polygon (64 segments) */
function generateCircle(lng: number, lat: number, radius: number): [number, number][] {
  const steps = 64;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (360 / steps) * i;
    coords.push(offsetPoint(lng, lat, radius, angle));
  }
  return coords;
}

/** Generate a sector polygon */
function generateSector(
  lng: number, lat: number, radius: number, bearing: number, angle: number,
): [number, number][] {
  const steps = 32;
  const startAngle = bearing - angle / 2;
  const endAngle = bearing + angle / 2;
  const coords: [number, number][] = [[lng, lat]]; // center point
  for (let i = 0; i <= steps; i++) {
    const a = startAngle + ((endAngle - startAngle) / steps) * i;
    coords.push(offsetPoint(lng, lat, radius, a));
  }
  coords.push([lng, lat]); // close back to center
  return coords;
}

/** Generate a rectangle polygon (oriented along bearing) */
function generateRect(
  lng: number, lat: number, radius: number, bearing: number,
): [number, number][] {
  const halfW = radius / 2;
  const halfH = radius * 0.3;
  const perpBearing = bearing + 90;

  const front = offsetPoint(lng, lat, halfH, bearing);
  const back = offsetPoint(lng, lat, halfH, bearing + 180);

  const tl = offsetPoint(front[0], front[1], halfW, perpBearing + 180);
  const tr = offsetPoint(front[0], front[1], halfW, perpBearing);
  const br = offsetPoint(back[0], back[1], halfW, perpBearing);
  const bl = offsetPoint(back[0], back[1], halfW, perpBearing + 180);

  return [tl, tr, br, bl, tl]; // closed ring
}

/** Build a GeoJSON FeatureCollection from coverage points */
function buildGeoJSON(
  shapeType: CoverageAreaLayerProps['shapeType'],
  points: CoveragePoint[],
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = points.map((pt) => {
    const [gcjLng, gcjLat] = wgs84ToGcj02(pt.lng, pt.lat);
    let ring: [number, number][];

    switch (shapeType) {
      case 'sector':
        ring = generateSector(gcjLng, gcjLat, pt.radius, pt.bearing ?? 0, pt.angle ?? 60);
        break;
      case 'rect':
        ring = generateRect(gcjLng, gcjLat, pt.radius, pt.bearing ?? 0);
        break;
      case 'circle':
      default:
        ring = generateCircle(gcjLng, gcjLat, pt.radius);
        break;
    }

    return {
      type: 'Feature' as const,
      properties: { id: pt.id },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [ring],
      },
    };
  });

  return { type: 'FeatureCollection', features };
}

// ── Component ───────────────────────────────────────────────────────────

export default function CoverageAreaLayer({
  shapeType,
  points,
  fillColor = 'rgba(77,166,255,0.4)',
  opacity = 0.06,
  zIndex = 4,
}: CoverageAreaLayerProps) {
  const scene = useMapScene();
  const layerRef = useRef<ILayer | null>(null);

  useEffect(() => {
    if (!scene || points.length === 0) {
      if (layerRef.current && scene) {
        scene.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    const geojson = buildGeoJSON(shapeType, points);

    const layer = new PolygonLayer({ zIndex })
      .source(geojson)
      .shape('fill')
      .color(fillColor)
      .style({ opacity });

    scene.addLayer(layer);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        scene.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [scene, shapeType, points, fillColor, opacity, zIndex]);

  return null;
}

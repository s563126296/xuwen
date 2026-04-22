import { useEffect, useRef } from 'react';
import { PolygonLayer, LineLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../../map/MapSceneContext';
import { mapFeatureCollectionToGcj } from '../../../utils/coordTransform';
import portBuildingsData from '../../../data/geo/portBuildings.json';
import odMatrixData from '../../../data/geo/odMatrix.json';

export default function PortBuildingLayer() {
  const scene = useMapScene();
  const buildingRef = useRef<ILayer | null>(null);
  const odRef = useRef<ILayer | null>(null);

  useEffect(() => {
    if (!scene) return;

    // 港口建筑多边形
    const buildingFeatures = (portBuildingsData as any[]).map((b) => ({
      type: 'Feature' as const,
      properties: { name: b.name, height: b.height || 10, scope: b.scope },
      geometry: { type: 'Polygon' as const, coordinates: [b.coords] },
    }));
    const gcjBuildings = mapFeatureCollectionToGcj({
      type: 'FeatureCollection', features: buildingFeatures,
    });

    const building = new PolygonLayer({ zIndex: 2 })
      .source(gcjBuildings)
      .shape('fill')
      .color('#00D0E9')
      .style({ opacity: 0.18 });

    // OD 弧线（航线流量）
    const odFeatures = (odMatrixData as any[]).map((od) => ({
      type: 'Feature' as const,
      properties: { label: od.label, flow: od.flow },
      geometry: {
        type: 'LineString' as const,
        coordinates: [od.origin, od.destination],
      },
    }));
    const gcjOD = mapFeatureCollectionToGcj({
      type: 'FeatureCollection', features: odFeatures,
    });

    const od = new LineLayer({ zIndex: 5 })
      .source(gcjOD)
      .shape('arc')
      .size('flow', [1, 4])
      .color('#00D0E9')
      .style({ opacity: 0.45 })
      .animate({ interval: 0.6, trailLength: 1.2, duration: 4 });

    scene.addLayer(building);
    scene.addLayer(od);
    buildingRef.current = building;
    odRef.current = od;

    return () => {
      [buildingRef, odRef].forEach((ref) => {
        if (ref.current) { scene.removeLayer(ref.current); ref.current = null; }
      });
    };
  }, [scene]);

  return null;
}

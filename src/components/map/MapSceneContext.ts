import { createContext, useContext } from 'react';
import type { Scene } from '@antv/l7';

export const MapSceneContext = createContext<Scene | null>(null);

export function useMapScene(): Scene | null {
  return useContext(MapSceneContext);
}

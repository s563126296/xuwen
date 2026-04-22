import { create } from 'zustand';

interface PortPanelState {
  /** 左侧展开的面板（最多2个） */
  leftExpanded: string[];
  /** 右侧展开的面板（最多2个） */
  rightExpanded: string[];
  toggleLeft: (panelId: string) => void;
  toggleRight: (panelId: string) => void;
}

function toggle(list: string[], id: string): string[] {
  if (list.includes(id)) return list.filter((x) => x !== id);
  if (list.length >= 2) return [...list.slice(1), id];
  return [...list, id];
}

export const usePortPanelStore = create<PortPanelState>((set) => ({
  leftExpanded: ['strait-index', 'weather'],
  rightExpanded: ['schedule', 'queue'],
  toggleLeft: (id) => set((s) => ({ leftExpanded: toggle(s.leftExpanded, id) })),
  toggleRight: (id) => set((s) => ({ rightExpanded: toggle(s.rightExpanded, id) })),
}));

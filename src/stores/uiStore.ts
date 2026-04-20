import { create } from 'zustand';
import type { SystemMode, PortType, DirectionType, ViewMode } from './types';

interface UIState {
  // System mode
  systemMode: SystemMode;
  setSystemMode: (mode: SystemMode) => void;

  // Port selection
  selectedPort: PortType;
  setSelectedPort: (port: PortType) => void;

  // Direction selection
  selectedDirection: DirectionType;
  setSelectedDirection: (direction: DirectionType) => void;

  // Device type selection (for checkpoint modal)
  selectedDeviceType: string;
  setSelectedDeviceType: (type: string) => void;

  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Modal states
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  pendingStrategyId: string | null;
  setPendingStrategy: (strategyId: string | null) => void;

  // Selected road for prediction modal
  selectedRoad: string | null;
  setSelectedRoad: (road: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // System mode
  systemMode: 'overview',
  setSystemMode: (mode) => set({ systemMode: mode }),

  // Port selection
  selectedPort: 'overview',
  setSelectedPort: (port) => set({ selectedPort: port }),

  // Direction selection
  selectedDirection: 'inbound',
  setSelectedDirection: (direction) => set({ selectedDirection: direction }),

  // Device type selection
  selectedDeviceType: 'checkpoint',
  setSelectedDeviceType: (type) => set({ selectedDeviceType: type }),

  // View mode
  viewMode: 'normal',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Modal states
  activeModal: null,
  setActiveModal: (modal) => set({ activeModal: modal }),
  pendingStrategyId: null,
  setPendingStrategy: (strategyId) => set({ pendingStrategyId: strategyId }),

  // Selected road
  selectedRoad: null,
  setSelectedRoad: (road) => set({ selectedRoad: road }),
}));

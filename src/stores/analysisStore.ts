import { create } from 'zustand';
import { generateHistoryEvents, generateStrategyRecords } from '../utils/analysisMockData';

// === Analysis Mode Types ===
export type HistoryEventType = 'congestion' | 'typhoon' | 'fog' | 'spring_rush' | 'accident' | 'normal';
export type HistoryEventSeverity = 'critical' | 'major' | 'minor' | 'info';
export type HistoryEventStatus = 'archived' | 'active' | 'pending_review';

export interface HistoryEvent {
  id: string;
  name: string;
  type: HistoryEventType;
  severity: HistoryEventSeverity;
  startTime: string;
  endTime: string | null;
  status: HistoryEventStatus;
  location: string;
  peakCongestionIndex: number;
  maxStrandedVehicles: number;
  strategiesUsed: string[];
  responseLevel: 'I' | 'II' | 'III' | 'IV' | null;
  summary: string;
  timeline: { time: string; action: string; actor: string; result: string }[];
}

export interface StrategyRecord {
  id: string;
  strategyId: string;
  strategyName: string;
  eventId: string;
  executedAt: string;
  completedAt: string | null;
  preIndex: number;
  postIndex: number;
  reliefMinutes: number;
  adopted: boolean;
  executor: string;
}

export interface AnalysisFilters {
  dateRange: { start: string; end: string };
  eventTypes: HistoryEventType[];
  strategyIds: string[];
  region: 'all' | 'port_road' | 's376' | 'g207' | 'county' | 'port';
  responseLevels: ('I' | 'II' | 'III' | 'IV')[];
  searchKeyword: string;
}

export interface AnalysisState {
  filters: AnalysisFilters;
  events: HistoryEvent[];
  strategyRecords: StrategyRecord[];
  selectedEventId: string | null;
  activeView: 'simulator' | 'trend' | 'compare' | 'strategy' | 'event' | 'heatmap';
  activeQuickFilter: string | null;
}

// === Analysis Store Interface ===
interface AnalysisStore {
  analysisState: AnalysisState;
  setAnalysisFilters: (filters: Partial<AnalysisFilters>) => void;
  selectAnalysisEvent: (eventId: string | null) => void;
  setAnalysisView: (view: AnalysisState['activeView']) => void;
  setAnalysisQuickFilter: (filter: string | null) => void;
}

// === Analysis Store Implementation ===
export const useAnalysisStore = create<AnalysisStore>((set) => ({
  analysisState: {
    filters: {
      dateRange: { start: '2025-10-01', end: '2026-04-19' },
      eventTypes: [],
      strategyIds: [],
      region: 'all',
      responseLevels: [],
      searchKeyword: '',
    },
    events: generateHistoryEvents() as HistoryEvent[],
    strategyRecords: generateStrategyRecords() as StrategyRecord[],
    selectedEventId: null,
    activeView: 'simulator',
    activeQuickFilter: null,
  },
  setAnalysisFilters: (filters) => set((state) => ({
    analysisState: {
      ...state.analysisState,
      filters: { ...state.analysisState.filters, ...filters },
      activeQuickFilter: null,
    },
  })),
  selectAnalysisEvent: (eventId) => set((state) => ({
    analysisState: {
      ...state.analysisState,
      selectedEventId: eventId,
      activeView: eventId ? 'event' : state.analysisState.activeView,
    },
  })),
  setAnalysisView: (view) => set((state) => ({
    analysisState: { ...state.analysisState, activeView: view, selectedEventId: view !== 'event' ? null : state.analysisState.selectedEventId },
  })),
  setAnalysisQuickFilter: (filter) => set((state) => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
    let newFilters = { ...state.analysisState.filters };
    switch (filter) {
      case 'today': newFilters = { ...newFilters, dateRange: { start: today, end: today }, eventTypes: [] }; break;
      case 'week': newFilters = { ...newFilters, dateRange: { start: weekAgo, end: today }, eventTypes: [] }; break;
      case 'spring': newFilters = { ...newFilters, dateRange: { start: '2026-01-28', end: '2026-02-16' }, eventTypes: ['spring_rush', 'congestion'] }; break;
      case 'typhoon': newFilters = { ...newFilters, dateRange: { start: '2025-10-01', end: today }, eventTypes: ['typhoon'] }; break;
      case 'congestion': newFilters = { ...newFilters, dateRange: { start: '2025-10-01', end: today }, eventTypes: ['congestion'] }; break;
      case 'holiday': newFilters = { ...newFilters, dateRange: { start: '2025-10-01', end: today }, eventTypes: ['congestion', 'spring_rush'] }; break;
    }
    return { analysisState: { ...state.analysisState, filters: newFilters, activeQuickFilter: filter } };
  }),
}));

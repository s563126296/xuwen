/**
 * Unified store exports
 * 统一的 Store 导出
 */

// UI Store
export { useUIStore } from './uiStore';

// Overview Store
export { useOverviewStore } from './overviewStore';
export type {
  PortData,
  CongestionPrediction,
  RoadCongestion,
  AiSummaryMetric,
  AiSummaryForecast,
  AiSummaryAction,
  AiSummaryCompare,
  AiSummary,
  NavigationStatus,
  StraitTransitIndex,
  PortDigestion,
  TidalStatus,
  TidalIntensity,
  TidalEffect,
  CorridorPressureItem,
  CorridorDirection,
  CorridorPressure,
  CorridorElasticityItem,
  SystemResilience,
  ShutdownLevel,
  ShutdownWindow,
  ShutdownProbability,
  IntersectionStatus,
  IntersectionHealth,
  HotspotType,
  TrafficHotspot,
  UrbanHealth,
  PressureNode,
  PressureOverallStatus,
  PressureTransmission,
  WeatherCouplingLevel,
  WeatherCoupling,
  EventImpactLevel,
  SpecialEvent,
  HolidayContext,
  CurrentWeather,
} from './overviewStore';

// Command Store
export { useCommandStore } from './commandStore';
export type {
  CongestionCauseType,
  CongestionCause,
  StrategyPermission,
  CommandStrategy,
  StrategyConflict,
  ExecutionStep,
  TimelineSlot,
  CommandContext,
  FieldPerson,
  CommandFeedItem,
  CommandResourceStatus,
  CommandFocusRoad,
  CommandState,
} from './commandStore';

// Emergency Store
export { useEmergencyStore } from './emergencyStore';
export type {
  EmergencyLevel,
  EmergencyPhase,
  PlanId,
  PlanStep,
  EmergencyPlan,
  ActivePlanExecution,
  EmergencyForecast,
  EmergencyTask,
  EmergencyResourcePoint,
  FieldResource,
  SpecialVehicleDetail,
  EmergencyTimelinePoint,
  EmergencyCommItem,
  EmergencyContact,
  EmergencyState,
} from './emergencyStore';

// Analysis Store
export { useAnalysisStore } from './analysisStore';
export type {
  HistoryEventType,
  HistoryEventSeverity,
  HistoryEventStatus,
  HistoryEvent,
  StrategyRecord,
  AnalysisFilters,
  AnalysisState,
} from './analysisStore';

// Evolution Store
export { useEvolutionStore } from './evolutionStore';
export type { EvolutionRecord } from './evolutionStore';

// AI Analysis Store
export { useAIAnalysisStore } from './aiAnalysisStore';
export type {
  HeatmapCell,
  PredictionPoint,
  CorrelationInsight,
  ActiveAlert,
  AlertHistoryItem,
  PropagationNode,
  AIRecommendation as AIAnalysisRecommendation,
  Strategy,
  RadarDimension,
  PortCityPoint,
  CurrentStateMetrics,
  ReasoningStep,
  DecisionRecommendation,
  AIAnalysisState,
} from './aiAnalysisStore';

// Port Store
export { usePortStore } from './portStore';
export type {
  StraitIndex,
  WeatherData,
  PortCapacity,
  PortVessel,
  ScheduleItem,
  QueueData,
  PortComparison,
  CrossingStats,
  WaitingArea,
  PortState,
} from './portStore';

// Simulator Store
export { useSimulatorStore } from './simulatorStore';
export type {
  SimulatorParams,
  SimulationResult,
  AIRecommendation,
} from './simulatorStore';

// Shared Types
export type { PortType, DirectionType, ViewMode, SystemMode, BaselineMode } from './types';

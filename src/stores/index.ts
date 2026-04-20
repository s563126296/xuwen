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

// AI Decision Store
export { useAIDecisionStore } from './aiDecisionStore';
export type {
  TrendPrediction,
  CausalNode,
  AIRecommendation,
  SafetyMetrics,
  AIDecisionState,
} from './aiDecisionStore';

// Shared Types
export type { PortType, DirectionType, ViewMode, SystemMode, BaselineMode } from './types';

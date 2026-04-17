import type { EmergencyLevel, EmergencyPhase, EmergencyTimelinePoint } from '../store/dashboardStore';

export function getEmergencyLevel(peakVehicles: number, shutdownHours: number): EmergencyLevel {
  if (peakVehicles > 3000 || shutdownHours > 72) return 'I';
  if (peakVehicles > 1500 || shutdownHours > 24) return 'II';
  if (peakVehicles > 500 || shutdownHours > 6) return 'III';
  return 'IV';
}

export function getEmergencyPhase(
  portShutdown: boolean,
  current: number,
  peak: number,
  recovered: boolean,
  resumingSoon: boolean,
): EmergencyPhase {
  if (!portShutdown) return 'warning';
  if (recovered) return 'recovery';
  if (resumingSoon) return 'recovery_prepare';
  if (current >= peak * 0.5) return 'peak';
  return 'shutdown_start';
}

export const PHASE_LABELS: Record<EmergencyPhase, string> = {
  warning: '阶段1：预警期',
  shutdown_start: '阶段2：停航初期',
  peak: '阶段3：滞留高峰',
  recovery_prepare: '阶段4：复航准备',
  recovery: '阶段5：复航消化',
};

export function buildEmergencyTimeline(current: number, peak: number): EmergencyTimelinePoint[] {
  return [
    { time: '12:00', value: Math.round(current * 0.15) },
    { time: '13:00', value: Math.round(current * 0.35) },
    { time: '14:00', value: Math.round(current * 0.6) },
    { time: '15:00', value: current, isCurrent: true },
    { time: '16:00', value: Math.round((current + peak) / 2), isPredicted: true },
    { time: '18:00', value: peak, isPredicted: true },
    { time: '22:00', value: Math.round(peak * 0.92), isPredicted: true },
    { time: '次日08:00', value: Math.round(peak * 0.75), isPredicted: true },
  ];
}

export function estimateSupplyDemand(strandedVehicles: number) {
  const strandedPeople = Math.round(strandedVehicles * 2);
  const boxedMeals = Math.round(strandedPeople * 3 * 1.2);
  const waterBoxes = Math.round((strandedPeople * 3 * 1.2) / 10);
  return { strandedPeople, boxedMeals, waterBoxes };
}

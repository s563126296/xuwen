/**
 * Strategy Reason Generator
 *
 * Generates recommendation reasons, match rates, confidence scores,
 * and effect checkpoints for strategy cards.
 */

import type { CommandStrategy, CongestionCause, CommandState } from '../stores/commandStore';

const STRATEGY_CAUSE_MAP: Record<string, string[]> = {
  'S-01': ['port_backlog', 'compound'],
  'S-02': ['port_backlog', 'construction', 'accident', 'compound'],
  'S-04': ['traffic_peak', 'construction'],
  'S-05': ['port_backlog', 'compound'],
  'S-07': ['accident'],
  'S-09': ['traffic_peak', 'weather'],
};

export interface EffectCheckpoint {
  label: string;
  minutesAfter: number;
  expectedIndex: number;
  status: 'pending' | 'current' | 'completed';
}

/**
 * Generate recommendation reason by interpolating reasonTemplate with current data.
 */
export function generateRecommendationReason(
  strategy: CommandStrategy,
  commandState: CommandState
): string {
  if (!strategy.reasonTemplate) {
    return '基于当前拥堵态势与历史执行表现，推荐优先采用此策略。';
  }

  let reason = strategy.reasonTemplate;

  reason = reason.replace(/{congestionIndex}/g, commandState.congestionIndex.toFixed(1));
  reason = reason.replace(/{queueLength}/g, commandState.focusRoad.queueLength);
  reason = reason.replace(/{laneCapacity}/g, '25');
  reason = reason.replace(/{s376Flow}/g, '45');
  reason = reason.replace(/{divertRatio}/g, '40');
  reason = reason.replace(/{saturation}/g, '85');
  reason = reason.replace(/{greenTime}/g, '90');
  reason = reason.replace(/{improvement}/g, '18');
  reason = reason.replace(/{waitingVehicles}/g, String(commandState.focusRoad.vehicles));
  reason = reason.replace(/{digestRate}/g, '180');
  reason = reason.replace(/{location}/g, commandState.focusRoad.road);
  reason = reason.replace(/{laneCount}/g, '2');
  reason = reason.replace(/{estimatedMin}/g, '35');
  reason = reason.replace(/{roadName}/g, commandState.focusRoad.road);
  reason = reason.replace(/{screenCount}/g, '4');

  const topCause = commandState.causes[0];
  if (topCause) {
    return `${reason} 当前主因是${topCause.label}，归因置信度${topCause.confidence}%。`;
  }

  return reason;
}

/**
 * Calculate match rate from cause-strategy mapping.
 */
export function calculateMatchRate(
  strategy: CommandStrategy,
  causes: CongestionCause[]
): number {
  if (causes.length === 0) return 60;

  const matchedTypes = STRATEGY_CAUSE_MAP[strategy.id] ?? [];
  const totalConfidence = causes.reduce((sum, cause) => sum + cause.confidence, 0);
  const matchedConfidence = causes
    .filter((cause) => matchedTypes.includes(cause.type))
    .reduce((sum, cause) => sum + cause.confidence, 0);

  if (totalConfidence === 0) return 60;

  const baseRate = Math.round((matchedConfidence / totalConfidence) * 100);
  const recommendationBoost = strategy.recommended ? 8 : 0;

  return Math.max(55, Math.min(98, baseRate + recommendationBoost));
}

/**
 * Calculate confidence score using cause match, historical data, and resource readiness.
 */
export function calculateConfidence(
  strategy: CommandStrategy,
  causes: CongestionCause[],
  commandState: CommandState
): number {
  const matchRate = calculateMatchRate(strategy, causes);
  const historicalSuccess = strategy.historicalData?.successRate ?? 0.75;

  const resourceReadiness = (strategy.requiredResources ?? []).reduce((score, resource) => {
    switch (resource.type) {
      case 'police':
        return score + (commandState.resources.policeAvailable >= resource.quantity ? 1 : 0.4);
      case 'tow_truck':
        return score + (commandState.resources.towTrucksAvailable >= resource.quantity ? 1 : 0.4);
      case 'cone': {
        const cone = commandState.executionResources.materials.find((item) => item.name === '锥桶');
        return score + ((cone?.ready ?? 0) >= resource.quantity ? 1 : 0.4);
      }
      case 'led_screen': {
        const led = commandState.executionResources.materials.find((item) => item.name === '诱导屏');
        return score + ((led?.ready ?? 0) >= resource.quantity ? 1 : 0.4);
      }
      default:
        return score;
    }
  }, 0);

  const totalResources = strategy.requiredResources?.length ?? 0;
  const resourceScore = totalResources > 0 ? resourceReadiness / totalResources : 1;

  const effectBonus = strategy.effectModel?.baseEffect
    ? Math.min(strategy.effectModel.baseEffect / 2, 1)
    : 0.6;

  const score =
    matchRate * 0.45 +
    historicalSuccess * 100 * 0.3 +
    resourceScore * 100 * 0.15 +
    effectBonus * 100 * 0.1;

  return Math.max(58, Math.min(96, Math.round(score)));
}

/**
 * Generate expected effect timeline checkpoints.
 */
export function generateEffectCheckpoints(
  strategy: CommandStrategy,
  currentIndex: number
): EffectCheckpoint[] {
  const requiredResources = strategy.requiredResources ?? [];
  const resourceArrivalMin = requiredResources.length > 0
    ? Math.max(...requiredResources.map((item) => item.estimatedArrivalMin))
    : 0;

  const targetIndex = parseEffectTarget(strategy.effect, currentIndex);
  const totalDrop = Math.max(0.3, currentIndex - targetIndex);
  const estimatedMinutes = parseDuration(strategy.time);

  const checkpoints: EffectCheckpoint[] = [
    {
      label: '资源到位',
      minutesAfter: resourceArrivalMin,
      expectedIndex: currentIndex,
      status: 'pending',
    },
    {
      label: '初步生效',
      minutesAfter: Math.max(resourceArrivalMin + 5, Math.round(estimatedMinutes * 0.3)),
      expectedIndex: Number((currentIndex - totalDrop * 0.35).toFixed(1)),
      status: 'pending',
    },
    {
      label: '中段检查',
      minutesAfter: Math.max(resourceArrivalMin + 15, Math.round(estimatedMinutes * 0.6)),
      expectedIndex: Number((currentIndex - totalDrop * 0.7).toFixed(1)),
      status: 'pending',
    },
    {
      label: '目标达成',
      minutesAfter: estimatedMinutes,
      expectedIndex: Number(targetIndex.toFixed(1)),
      status: 'current',
    },
  ];

  return checkpoints;
}

function parseEffectTarget(effect: string, fallbackIndex: number): number {
  const match = effect.match(/→\s*(\d+(?:\.\d+)?)/);
  if (match) {
    return Number(match[1]);
  }

  if (effect.includes('恢复通行')) {
    return Math.max(2.5, fallbackIndex - 2.0);
  }

  if (effect.includes('消化+30%')) {
    return Math.max(3.8, fallbackIndex - 1.5);
  }

  return Math.max(4.0, fallbackIndex - 1.0);
}

function parseDuration(timeText: string): number {
  const minuteMatch = timeText.match(/(\d+)\s*分钟/);
  if (minuteMatch) {
    return Number(minuteMatch[1]);
  }

  const hourMatch = timeText.match(/(\d+)\s*小时/);
  if (hourMatch) {
    return Number(hourMatch[1]) * 60;
  }

  if (timeText.includes('即时')) {
    return 5;
  }

  return 30;
}

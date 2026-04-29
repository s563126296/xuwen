/**
 * Risk Prediction Engine
 *
 * Predictive tiered trigger for overview → command mode transition.
 * Analyzes current metrics + trends to predict congestion 30min ahead.
 */

export type RiskLevel = 'normal' | 'low' | 'high' | 'emergency';

export interface RiskPrediction {
  level: RiskLevel;
  predictedIndex: number;
  timeToReach: number; // minutes until predicted congestion level
  confidence: number;  // 0-100
  reason: string;
}

export interface RiskInputs {
  currentIndex: number;
  trend: 'rising' | 'stable' | 'falling';
  portBacklog: number;       // waiting vehicles at port
  weatherSeverity: number;   // 0-100 weather coupling score
  corridorPressureMax: number; // highest corridor pressure %
  hasAccident: boolean;
  isHoliday: boolean;
  holidayMultiplier: number;
}

/**
 * Predict risk level based on current metrics and trends.
 *
 * Levels:
 *   normal    — no action needed
 *   low       — AI predicts congestion 4-5 in 30min → yellow warning
 *   high      — AI predicts congestion >6 in 30min → popup suggesting command mode
 *   emergency — accident/shutdown/actual >6 → auto-switch to command mode
 */
export function predictRisk(inputs: RiskInputs): RiskPrediction {
  const { currentIndex, hasAccident } = inputs;

  // Emergency: actual congestion > 6 or accident detected
  if (currentIndex > 6 || hasAccident) {
    return {
      level: 'emergency',
      predictedIndex: currentIndex,
      timeToReach: 0,
      confidence: 95,
      reason: hasAccident
        ? '检测到交通事故，需立即启动指挥模式'
        : `拥堵指数已达 ${currentIndex.toFixed(1)}，超过紧急阈值`,
    };
  }

  // Predict 30-min-ahead congestion index
  const predicted = predict30MinIndex(inputs);

  // Emergency: predicted > 7 with high confidence AND current index already > 5
  // (prevents scenario presets from triggering emergency when current index is moderate)
  if (predicted.index > 7 && predicted.confidence > 70 && currentIndex > 5) {
    return {
      level: 'emergency',
      predictedIndex: predicted.index,
      timeToReach: predicted.minutesToReach,
      confidence: predicted.confidence,
      reason: `预测 ${predicted.minutesToReach} 分钟后拥堵指数将达 ${predicted.index.toFixed(1)}，建议立即进入指挥模式`,
    };
  }

  // High risk: predicted > 6
  if (predicted.index > 6) {
    return {
      level: 'high',
      predictedIndex: predicted.index,
      timeToReach: predicted.minutesToReach,
      confidence: predicted.confidence,
      reason: buildHighRiskReason(predicted, inputs),
    };
  }

  // Low risk: predicted 4-6
  if (predicted.index >= 4) {
    return {
      level: 'low',
      predictedIndex: predicted.index,
      timeToReach: predicted.minutesToReach,
      confidence: predicted.confidence,
      reason: buildLowRiskReason(predicted, inputs),
    };
  }

  // Normal
  return {
    level: 'normal',
    predictedIndex: predicted.index,
    timeToReach: 30,
    confidence: predicted.confidence,
    reason: '交通态势平稳，无需干预',
  };
}

// ---------------------------------------------------------------------------
// Internal prediction model
// ---------------------------------------------------------------------------

interface PredictionResult {
  index: number;
  minutesToReach: number;
  confidence: number;
}

function predict30MinIndex(inputs: RiskInputs): PredictionResult {
  const { currentIndex, trend, portBacklog, weatherSeverity, corridorPressureMax, isHoliday, holidayMultiplier } = inputs;

  // Base: trend-based linear projection
  let trendDelta = 0;
  if (trend === 'rising') trendDelta = 1.2;
  else if (trend === 'stable') trendDelta = 0.1;
  else trendDelta = -0.8;

  // Port backlog factor: >800 vehicles adds pressure
  let portFactor = 0;
  if (portBacklog > 1000) portFactor = 1.0;
  else if (portBacklog > 800) portFactor = 0.6;
  else if (portBacklog > 500) portFactor = 0.3;

  // Weather factor
  let weatherFactor = 0;
  if (weatherSeverity > 70) weatherFactor = 0.8;
  else if (weatherSeverity > 50) weatherFactor = 0.4;
  else if (weatherSeverity > 30) weatherFactor = 0.1;

  // Corridor saturation factor
  let corridorFactor = 0;
  if (corridorPressureMax > 90) corridorFactor = 0.6;
  else if (corridorPressureMax > 80) corridorFactor = 0.3;

  // Holiday amplifier
  const holidayFactor = isHoliday ? Math.min(0.5, (holidayMultiplier - 1) * 0.2) : 0;

  const totalDelta = trendDelta + portFactor + weatherFactor + corridorFactor + holidayFactor;
  const predictedIndex = Math.max(0, Math.min(10, currentIndex + totalDelta));

  // Estimate time to reach predicted level (linear interpolation)
  const minutesToReach = totalDelta > 0
    ? Math.round(30 * Math.min(1, (predictedIndex - currentIndex) / Math.max(0.1, totalDelta)))
    : 30;

  // Confidence: higher when more factors agree
  let confidence = 60;
  const factorsAligned = [
    trend === 'rising',
    portBacklog > 800,
    corridorPressureMax > 85,
    weatherSeverity > 50,
  ].filter(Boolean).length;
  confidence += factorsAligned * 8;
  // Lower confidence when prediction is far from current
  if (Math.abs(predictedIndex - currentIndex) > 3) confidence -= 10;
  confidence = Math.max(40, Math.min(95, confidence));

  return { index: predictedIndex, minutesToReach, confidence };
}

function buildHighRiskReason(pred: PredictionResult, inputs: RiskInputs): string {
  const factors: string[] = [];
  if (inputs.trend === 'rising') factors.push('车流持续上升');
  if (inputs.portBacklog > 800) factors.push(`港口积压 ${inputs.portBacklog} 辆`);
  if (inputs.corridorPressureMax > 85) factors.push(`通道压力 ${inputs.corridorPressureMax}%`);
  if (inputs.weatherSeverity > 50) factors.push('天气影响');

  const factorStr = factors.length > 0 ? `（${factors.join('、')}）` : '';
  return `预测 ${pred.minutesToReach} 分钟后拥堵指数将达 ${pred.index.toFixed(1)}${factorStr}，建议提前进入指挥模式`;
}

function buildLowRiskReason(pred: PredictionResult, inputs: RiskInputs): string {
  const factors: string[] = [];
  if (inputs.trend === 'rising') factors.push('车流上升趋势');
  if (inputs.portBacklog > 500) factors.push('港口排队增加');
  if (inputs.corridorPressureMax > 80) factors.push('通道压力偏高');

  const factorStr = factors.length > 0 ? `（${factors.join('、')}）` : '';
  return `预测 ${pred.minutesToReach} 分钟后拥堵指数可能达 ${pred.index.toFixed(1)}${factorStr}，请关注`;
}

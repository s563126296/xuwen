# Batch 1: Command Mode Loop Restructure - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the first batch of business logic restructure for command mode: strategy definition upgrade, resource panel refactor, deviation attribution enhancement, field feedback AI extraction, structured review report, and feedback-to-learning data flow.

**Architecture:** React 18 + TypeScript + Zustand. Extends `commandStore.ts`, `commandEngine.ts`, `strategyMonitorEngine.ts`. Creates new data structures for resource binding, effect models, execution records, and evolution tracking.

**Tech Stack:** React 18.3 + TypeScript 5.4 + Zustand 4.5 + Vite 5.4

**Design Spec:** `docs/superpowers/specs/2026-04-28-business-logic-restructure-design.md`

---

## Task 1: Strategy Definition Upgrade - Data Structure

**Files:**
- Modify: `src/stores/commandStore.ts`
- Modify: `src/utils/commandEngine.ts`

- [ ] **Step 1.1: Add new types to commandStore.ts (after line 21)**

```typescript
export interface ResourceRequirement {
  type: 'police' | 'cone' | 'led_screen' | 'tow_truck';
  quantity: number;
  estimatedArrivalMin: number;
}

export interface EffectModel {
  baseEffect: number;
  factorModifiers: {
    weather_rain: number;
    weather_fog: number;
    truck_ratio_high: number;
    road_congested: number;
    inflow_high: number;
  };
}

export interface HistoricalData {
  executionCount: number;
  successRate: number;
  avgReliefMinutes: number;
}
```

- [ ] **Step 1.2: Extend CommandStrategy interface (line 25)**

Add to existing interface:
```typescript
  reasonTemplate?: string;
  requiredResources?: ResourceRequirement[];
  effectModel?: EffectModel;
  historicalData?: HistoricalData;
```

- [ ] **Step 1.3: Update STRATEGY_DB in commandEngine.ts**

Add to S-01, S-02, S-04 strategies:
```typescript
    reasonTemplate: '...',
    requiredResources: [...],
    effectModel: { baseEffect: X, factorModifiers: {...} },
    historicalData: { executionCount: X, successRate: Y, avgReliefMinutes: Z },
```

- [ ] **Step 1.4: Verify compilation**

Run: `npx tsc --noEmit`

- [ ] **Step 1.5: Commit**

```bash
git add src/stores/commandStore.ts src/utils/commandEngine.ts
git commit -m "feat(command): upgrade strategy definition with resources and effect model

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Execution Record Data Structure

**Files:**
- Modify: `src/stores/commandStore.ts`

- [ ] **Step 2.1: Add ExecutionRecord types**

```typescript
export interface ExecutionVersion {
  version: string;
  content: string;
  reason: string;
  expectedCurve: { minutesAfter: number; expected: number }[];
  timestamp: number;
}

export interface DeviationEvent {
  timestamp: number;
  type: 'strategy' | 'execution' | 'environment';
  reason: string;
  action: string;
  resolutionMinutes: number;
}

export interface ExecutionRecord {
  id: string;
  strategyId: string;
  startTime: number;
  endTime: number | null;
  versions: ExecutionVersion[];
  actualCurve: { timestamp: number; congestionIndex: number }[];
  deviationEvents: DeviationEvent[];
  resourceArrival: { estimated: number; actual: number };
  rating: 'effective' | 'moderate' | 'ineffective' | null;
  comment: string;
  aiLearnings: { newFactor: string; affectedStrategies: string[]; accuracyChange: { before: number; after: number } }[];
}
```

- [ ] **Step 2.2: Add to CommandState**

```typescript
  executionRecords: ExecutionRecord[];
  activeExecutionId: string | null;
```

- [ ] **Step 2.3: Add store actions**

```typescript
  addExecutionRecord: (record: ExecutionRecord) => void;
  updateExecutionRecord: (id: string, updates: Partial<ExecutionRecord>) => void;
  setActiveExecutionId: (id: string | null) => void;
```

- [ ] **Step 2.4: Verify and commit**

```bash
npx tsc --noEmit
git add src/stores/commandStore.ts
git commit -m "feat(command): add ExecutionRecord for learning loop

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Resource Decision Panel

**Files:**
- Create: `src/components/command/ResourceDecisionPanel.tsx`
- Modify: `src/components/command/StrategyCommandPanel.tsx`

- [ ] **Step 3.1: Create ResourceDecisionPanel component**

Full component with:
- Resource status calculation (required vs available)
- Estimated arrival time display
- Manual time adjustment (edit icon)
- Overall satisfaction status
- Action suggestions

- [ ] **Step 3.2: Integrate into StrategyCommandPanel**

Import and render after ActiveStrategyCard

- [ ] **Step 3.3: Test in browser**

```bash
npm run dev
```
Verify: resource panel shows, times editable, status correct

- [ ] **Step 3.4: Commit**

```bash
git add src/components/command/ResourceDecisionPanel.tsx src/components/command/StrategyCommandPanel.tsx
git commit -m "feat(command): add resource decision panel with arrival time

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Deviation Attribution Enhancement

**Files:**
- Modify: `src/utils/strategyMonitorEngine.ts`
- Modify: `src/stores/commandStore.ts`

- [ ] **Step 4.1: Add deviation types**

```typescript
export type DeviationType = 'strategy' | 'execution' | 'environment';

export interface DeviationAnalysis {
  timestamp: number;
  deviationPercent: number;
  primaryType: DeviationType;
  factors: { factor: string; weight: number; category: DeviationType; description: string }[];
  recommendation: string;
}
```

- [ ] **Step 4.2: Enhance analyzeDeviation function**

Replace with 11-factor analysis returning DeviationAnalysis

- [ ] **Step 4.3: Update InquiryModal to show analysis**

Display primaryType, factors, recommendation

- [ ] **Step 4.4: Test and commit**

```bash
npm run dev
# Test deviation scenarios
git add src/utils/strategyMonitorEngine.ts src/stores/commandStore.ts src/components/command/InquiryModal.tsx
git commit -m "feat(command): enhance deviation analysis with 11 factors and 3 categories

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Field Feedback AI Extraction

**Files:**
- Create: `src/utils/feedbackAIEngine.ts`
- Modify: `src/components/command/ChatWindow.tsx`

- [ ] **Step 5.1: Create feedbackAIEngine**

```typescript
export function extractKeyInfo(message: string): {
  hasKeyInfo: boolean;
  category: 'obstacle' | 'resource' | 'condition' | null;
  extracted: string;
  confidence: number;
} {
  // Pattern matching for key phrases
  // Return structured extraction
}

export function generateAIConfirmation(extracted: string, category: string): {
  confirmation: string;
  impactAssessment: string;
  question: string;
  options: string[];
} {
  // Generate AI response
}
```

- [ ] **Step 5.2: Integrate into ChatWindow**

Add AI message after field message when key info detected

- [ ] **Step 5.3: Test and commit**

```bash
npm run dev
# Test chat with key phrases
git add src/utils/feedbackAIEngine.ts src/components/command/ChatWindow.tsx
git commit -m "feat(command): add AI extraction for field feedback

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Structured Review Report

**Files:**
- Modify: `src/components/command/CommandReportModal.tsx`

- [ ] **Step 6.1: Enhance report structure**

Add sections:
- Version iteration timeline
- Deviation events table
- AI learning summary
- Rating with comment textarea

- [ ] **Step 6.2: Connect to ExecutionRecord**

Read from activeExecutionId, display all data

- [ ] **Step 6.3: Test and commit**

```bash
npm run dev
# Complete a strategy execution, verify report
git add src/components/command/CommandReportModal.tsx
git commit -m "feat(command): add structured review report with version history

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Feedback to Learning Data Flow

**Files:**
- Modify: `src/utils/strategyMonitorEngine.ts`
- Create: `src/stores/evolutionStore.ts`

- [ ] **Step 7.1: Create evolutionStore**

```typescript
export interface EvolutionRecord {
  version: string;
  date: string;
  triggerEvent: string;
  changeDescription: string;
  affectedStrategies: string[];
  accuracyBefore: number;
  accuracyAfter: number;
}

interface EvolutionState {
  records: EvolutionRecord[];
  currentVersion: string;
  addRecord: (record: EvolutionRecord) => void;
}
```

- [ ] **Step 7.2: Write learning data on strategy completion**

In stopMonitoring, call addExecutionRecord and conditionally addEvolutionRecord

- [ ] **Step 7.3: Test and commit**

```bash
npm run dev
# Complete strategy, verify data written
git add src/stores/evolutionStore.ts src/utils/strategyMonitorEngine.ts
git commit -m "feat(command): implement feedback to learning data flow

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Completion Checklist

- [ ] All 7 tasks completed
- [ ] TypeScript compiles without errors
- [ ] Browser testing passed for all new components
- [ ] All commits follow conventional commit format
- [ ] Design spec requirements covered

---

**Plan complete.** Ready for execution via subagent-driven-development or executing-plans skill.

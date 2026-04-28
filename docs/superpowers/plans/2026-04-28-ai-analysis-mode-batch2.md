# Batch 2: AI Analysis Mode - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement AI Analysis Mode with 4 features: Strategy Simulator, Evolution Records, Decision Tree, and Knowledge Graph for strategy analysis and learning visualization.

**Architecture:** React 18 + TypeScript + Zustand. New components in `src/components/analysis/`, uses Recharts for charts, custom SVG for tree/graph.

**Tech Stack:** React 18.3 + TypeScript 5.4 + Zustand 4.5 + Recharts 2.12 + Vite 5.4

**Design Spec:** `docs/superpowers/specs/2026-04-28-business-logic-restructure-design.md` Section VI

---

## Task 1: Strategy Simulator

**Files:**
- Create: `src/stores/simulatorStore.ts`
- Create: `src/utils/simulationEngine.ts`
- Create: `src/components/analysis/StrategySimulator.tsx`
- Modify: `src/stores/index.ts`

### Step 1.1: Create simulator store

Create `src/stores/simulatorStore.ts` with SimulatorParams, SimulationResult types and state management.

### Step 1.2: Create simulation engine

Create `src/utils/simulationEngine.ts` with effect calculation using strategy effectModel.

### Step 1.3: Create simulator UI

Create `src/components/analysis/StrategySimulator.tsx` with parameter panel (9 params) and results chart.

### Step 1.4: Verify and commit

```bash
npx tsc --noEmit
git add src/stores/simulatorStore.ts src/utils/simulationEngine.ts src/components/analysis/StrategySimulator.tsx src/stores/index.ts
git commit -m "feat(analysis): implement strategy simulator with parameter panel and results

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Strategy Evolution Records

**Files:**
- Create: `src/components/analysis/EvolutionRecords.tsx`

### Step 2.1: Create evolution timeline component

Read from `useEvolutionStore` (already exists from Batch 1), display timeline with accuracy trend chart.

### Step 2.2: Verify and commit

```bash
npx tsc --noEmit
git add src/components/analysis/EvolutionRecords.tsx
git commit -m "feat(analysis): add evolution records timeline with accuracy trend

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Strategy Decision Tree

**Files:**
- Create: `src/components/analysis/DecisionTree.tsx`
- Create: `src/utils/decisionTreeData.ts`

### Step 3.1: Define tree structure

Create `src/utils/decisionTreeData.ts` based on CAUSE_STRATEGY_MAP from commandEngine.

### Step 3.2: Create tree visualization

Create `src/components/analysis/DecisionTree.tsx` with interactive SVG tree.

### Step 3.3: Verify and commit

```bash
npx tsc --noEmit
git add src/components/analysis/DecisionTree.tsx src/utils/decisionTreeData.ts
git commit -m "feat(analysis): add interactive strategy decision tree

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Strategy Knowledge Graph

**Files:**
- Create: `src/components/analysis/KnowledgeGraph.tsx`
- Create: `src/utils/knowledgeGraphData.ts`

### Step 4.1: Define graph structure

Create `src/utils/knowledgeGraphData.ts` with nodes (strategies + factors) and edges (mutex/linkage/influence).

### Step 4.2: Create graph visualization

Create `src/components/analysis/KnowledgeGraph.tsx` with force-directed layout.

### Step 4.3: Verify and commit

```bash
npx tsc --noEmit
git add src/components/analysis/KnowledgeGraph.tsx src/utils/knowledgeGraphData.ts
git commit -m "feat(analysis): add strategy knowledge graph with relationships

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Analysis Mode Integration

**Files:**
- Modify: `src/components/analysis/AnalysisView.tsx` or create if not exists
- Modify: Navigation to add Analysis mode tab

### Step 5.1: Create analysis view with 4 tabs

Integrate all 4 components into tabbed interface.

### Step 5.2: Add navigation

Ensure analysis mode is accessible from main navigation.

### Step 5.3: Final verification and commit

```bash
npm run dev
# Test all 4 features in browser
npx tsc --noEmit
git add src/components/analysis/AnalysisView.tsx
git commit -m "feat(analysis): integrate all 4 AI analysis features into tabbed view

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

**Plan complete.** Ready for execution via subagent-driven-development.

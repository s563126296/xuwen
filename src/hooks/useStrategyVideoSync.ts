import { useEffect, useRef } from 'react';
import { useCommandStore } from '../stores/commandStore';
import type { CommandStrategy } from '../stores/commandStore';

/**
 * Strategy-to-video source mapping
 * Maps strategy IDs to their most relevant video channel indices
 */
const STRATEGY_VIDEO_MAP: Record<string, number> = {
  // S-02/S-03: Diversion strategies → Junction cameras (channels 1-2)
  'S-02': 1, // S376 diversion → Huasi Village camera
  'S-03': 2, // G207 diversion → Highway entrance camera

  // S-01/S-13: Lane borrowing → Main road camera (channel 0)
  'S-01': 0, // Emergency lane → City junction camera
  'S-13': 0, // Lane adjustment → City junction camera

  // S-07: Accident handling → Accident site camera (channel 2)
  'S-07': 2, // Accident → Highway entrance (accident site)

  // S-04: Signal optimization → Key intersection camera (channel 3)
  'S-04': 3, // Signal optimization → Nanshan Village camera

  // S-08: Temporary parking → Parking area camera (channel 4)
  'S-08': 4, // Temporary parking → Port entrance camera

  // S-14: Police reinforcement → Deployment point camera (channel 3)
  'S-14': 3, // Police deployment → Nanshan Village camera
};

/**
 * Human-readable labels for strategy-to-video associations
 */
const STRATEGY_VIDEO_LABELS: Record<string, string> = {
  'S-02': '分流路口摄像头',
  'S-03': '分流路口摄像头',
  'S-01': '进港大道摄像头',
  'S-13': '进港大道摄像头',
  'S-07': '事故点摄像头',
  'S-04': '关键路口摄像头',
  'S-08': '停车区摄像头',
  'S-14': '部署点位摄像头',
};

export interface StrategyVideoInfo {
  strategyId: string;
  strategyName: string;
  videoLabel: string;
  channel: number;
}

/**
 * Hook: auto-switch video channel when a strategy starts executing.
 *
 * Watches commandStore strategies for status changes to 'executing'.
 * After the 5-second incoming-call delay, switches the video panel
 * to the most relevant camera for that strategy.
 *
 * Returns info about the currently linked strategy (if any) so the
 * UI can show an indicator.
 *
 * Allows manual override: if the user manually switches the channel,
 * the auto-switch won't fight back until a NEW strategy starts executing.
 */
export function useStrategyVideoSync(): StrategyVideoInfo | null {
  const strategies = useCommandStore((s) => s.commandState.strategies);
  const setActiveVideoChannel = useCommandStore((s) => s.setActiveVideoChannel);
  const activeVideoChannel = useCommandStore((s) => s.commandState.activeVideoChannel);

  // Track which strategy we already auto-switched for (avoid re-triggering)
  const lastSyncedStrategyRef = useRef<string | null>(null);
  // Track whether user manually overrode the channel
  const userOverrodeRef = useRef(false);
  // Track the channel we set via auto-switch
  const autoSwitchedChannelRef = useRef<number | null>(null);
  // Timer ref for cleanup
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect manual override: if activeVideoChannel changed and doesn't match
  // what we auto-set, the user switched manually
  useEffect(() => {
    if (
      autoSwitchedChannelRef.current !== null &&
      activeVideoChannel !== autoSwitchedChannelRef.current
    ) {
      userOverrodeRef.current = true;
    }
  }, [activeVideoChannel]);

  // Watch for newly executing strategies
  useEffect(() => {
    const executingStrategy = strategies.find(
      (s: CommandStrategy) => s.status === 'executing'
    );

    if (!executingStrategy) {
      // Reset when no strategy is executing (new cycle)
      lastSyncedStrategyRef.current = null;
      userOverrodeRef.current = false;
      autoSwitchedChannelRef.current = null;
      return;
    }

    // Skip if we already synced for this strategy
    if (lastSyncedStrategyRef.current === executingStrategy.id) return;

    // New strategy executing — reset override flag for this new strategy
    userOverrodeRef.current = false;
    lastSyncedStrategyRef.current = executingStrategy.id;

    const targetChannel = STRATEGY_VIDEO_MAP[executingStrategy.id];
    if (targetChannel === undefined) return;

    // Delay 5.5s to coordinate with the incoming call handler (5s delay)
    // Video switches slightly after the call modal appears
    timerRef.current = setTimeout(() => {
      if (!userOverrodeRef.current) {
        autoSwitchedChannelRef.current = targetChannel;
        setActiveVideoChannel(targetChannel);
      }
    }, 5500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [strategies, setActiveVideoChannel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Return info about the currently linked strategy for UI display
  const executingStrategy = strategies.find(
    (s: CommandStrategy) => s.status === 'executing'
  );

  if (!executingStrategy) return null;

  const channel = STRATEGY_VIDEO_MAP[executingStrategy.id];
  if (channel === undefined) return null;

  return {
    strategyId: executingStrategy.id,
    strategyName: executingStrategy.name,
    videoLabel: STRATEGY_VIDEO_LABELS[executingStrategy.id] ?? '关联摄像头',
    channel,
  };
}

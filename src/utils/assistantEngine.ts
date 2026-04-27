/**
 * Virtual Assistant TTS Engine
 * Handles text-to-speech broadcast logic for "阿琼" character
 */

import { useOverviewStore } from '../stores/overviewStore';

// TTS instance (singleton)
let speechSynthesis: SpeechSynthesis | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Initialize TTS engine
 * @returns true if TTS is supported, false otherwise
 */
export function initTTS(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis;
    return true;
  }
  console.warn('[Assistant] TTS not supported in this browser');
  return false;
}

/**
 * Speak a message using TTS
 * @param message - Text to speak
 * @param onEnd - Optional callback when speech ends
 */
export function speak(message: string, onEnd?: () => void): void {
  const { assistantState, setAssistantStatus, setAssistantMessage } = useOverviewStore.getState();

  // Check if muted
  if (assistantState.muted) {
    console.log('[Assistant] Muted, skipping speech:', message);
    return;
  }

  // Check TTS support
  if (!speechSynthesis) {
    console.warn('[Assistant] TTS not supported');
    return;
  }

  // Cancel current speech
  if (currentUtterance) {
    speechSynthesis.cancel();
  }

  // Create utterance
  currentUtterance = new SpeechSynthesisUtterance(message);
  currentUtterance.lang = 'zh-CN';
  currentUtterance.rate = 1.0;
  currentUtterance.pitch = 1.1; // Slightly higher pitch for friendly tone
  currentUtterance.volume = 0.8;

  // Update state
  setAssistantStatus('speaking');
  setAssistantMessage(message);

  // Event handlers
  currentUtterance.onend = () => {
    setAssistantStatus('idle');
    setAssistantMessage('');
    currentUtterance = null;
    onEnd?.();
  };

  currentUtterance.onerror = (event) => {
    console.error('[Assistant] TTS error:', event);
    setAssistantStatus('idle');
    setAssistantMessage('');
    currentUtterance = null;
  };

  // Speak
  speechSynthesis.speak(currentUtterance);
}

/**
 * Stop current speech
 */
export function stopSpeaking(): void {
  if (speechSynthesis && currentUtterance) {
    speechSynthesis.cancel();
    const { setAssistantStatus, setAssistantMessage } = useOverviewStore.getState();
    setAssistantStatus('idle');
    setAssistantMessage('');
    currentUtterance = null;
  }
}

/**
 * Broadcast scenarios for different events
 */
export const BroadcastScenarios = {
  /**
   * System startup broadcast
   */
  systemStartup: () => {
    const { aiSummary } = useOverviewStore.getState();
    if (!aiSummary) return;

    const message = `系统已启动。当前态势${aiSummary.conclusion}。${aiSummary.suggestionHint}`;
    speak(message);
  },

  /**
   * Alert triggered broadcast
   */
  alertTriggered: (alertContent: string) => {
    const message = `检测到异常：${alertContent}`;
    speak(message);
  },

  /**
   * Hourly report broadcast
   */
  hourlyReport: () => {
    const { portDigestion, tidalEffect, systemResilience } = useOverviewStore.getState();
    const message = `整点播报：港口待渡${portDigestion.xuwen.waitingVehicles}辆，进港${tidalEffect.inboundFlow}辆，出港${tidalEffect.outboundFlow}辆，系统韧性${systemResilience.score}分。`;
    speak(message);
  },

  /**
   * Mode switch suggestion broadcast
   */
  modeSwitchSuggestion: (targetMode: string, reason: string) => {
    const message = `建议切换到${targetMode}模式，${reason}`;
    speak(message);
  },
};

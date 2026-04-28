/**
 * Virtual Assistant TTS Engine
 * Handles text-to-speech broadcast logic for "阿琼" character
 */

import { useOverviewStore } from '../stores/overviewStore';

let speechSynthesis: SpeechSynthesis | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let lastAlertTime = 0;
const ALERT_COOLDOWN = 10 * 60 * 1000; // 10 minutes

export function initTTS(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis;
    return true;
  }
  return false;
}

export function speak(message: string, onEnd?: () => void): void {
  const { assistantState, setAssistantStatus, setAssistantMessage } = useOverviewStore.getState();

  if (assistantState.muted) return;
  if (!speechSynthesis) return;

  if (currentUtterance) {
    speechSynthesis.cancel();
  }

  currentUtterance = new SpeechSynthesisUtterance(message);
  currentUtterance.lang = 'zh-CN';
  currentUtterance.rate = 1.0;
  currentUtterance.pitch = 1.1;
  currentUtterance.volume = 0.8;

  setAssistantStatus('speaking');
  setAssistantMessage(message);

  currentUtterance.onend = () => {
    setAssistantStatus('idle');
    setAssistantMessage('');
    currentUtterance = null;
    onEnd?.();
  };

  currentUtterance.onerror = () => {
    setAssistantStatus('idle');
    setAssistantMessage('');
    currentUtterance = null;
  };

  speechSynthesis.speak(currentUtterance);
}

export function stopSpeaking(): void {
  if (speechSynthesis && currentUtterance) {
    speechSynthesis.cancel();
    const { setAssistantStatus, setAssistantMessage } = useOverviewStore.getState();
    setAssistantStatus('idle');
    setAssistantMessage('');
    currentUtterance = null;
  }
}

export const BroadcastScenarios = {
  dailyStartup: () => {
    const key = 'xiaowen_last_daily';
    const today = new Date().toDateString();
    if (localStorage.getItem(key) === today) return;

    const { aiSummary, portDigestion, systemResilience } = useOverviewStore.getState();
    if (!aiSummary) return;

    localStorage.setItem(key, today);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

    const message = `${greeting}，我是小闻。昨日进港车辆约1万2千辆，港口平均等待35分钟，处理拥堵事件3次。今日预计进港1万5千辆，当前${aiSummary.conclusion}，港口待渡${portDigestion.xuwen.waitingVehicles}辆，系统韧性${systemResilience.score}分。建议重点关注进港大道晚高峰时段。`;
    speak(message);
  },

  weeklyStartup: () => {
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek !== 1) return;

    const key = 'xiaowen_last_weekly';
    const thisWeek = `${new Date().getFullYear()}-W${Math.ceil(new Date().getDate() / 7)}`;
    if (localStorage.getItem(key) === thisWeek) return;
    localStorage.setItem(key, thisWeek);

    const message = `周一好，我是小闻。上周整体情况：共处理车辆约8万5千辆，同比增长12%。发生拥堵事件15次，平均缓解时间28分钟。策略执行24次，采纳率68%，AI预测准确率84%。本周预计车流量与上周持平，周五晚高峰需重点关注。`;
    speak(message);
  },

  systemStartup: () => {
    const { aiSummary } = useOverviewStore.getState();
    if (!aiSummary) return;
    const message = `系统已启动，当前${aiSummary.conclusion}`;
    speak(message);
  },

  alertTriggered: (alertContent: string) => {
    const now = Date.now();
    if (now - lastAlertTime < ALERT_COOLDOWN) return;
    lastAlertTime = now;
    speak(`注意，${alertContent}`);
  },

  modeSwitchSuggestion: (targetMode: string, reason: string) => {
    speak(`建议切换到${targetMode}模式，${reason}`);
  },
};

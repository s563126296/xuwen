import { useEffect, useRef } from 'react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { useUIStore } from '../../stores/uiStore';
import type { SpecialVehicleDetail } from '../../stores/emergencyStore';
import { buildEmergencyTimeline } from '../../utils/emergencyEngine';

function getAlertLevel(hours: number): SpecialVehicleDetail['alertLevel'] {
  if (hours >= 24) return 'red';
  if (hours >= 12) return 'orange';
  if (hours >= 6) return 'yellow';
  return 'normal';
}

export default function EmergencySimulator() {
  const emergency = useEmergencyStore((s) => s.emergencyState);
  const setEmergencyState = useEmergencyStore((s) => s.setEmergencyState);
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const autoTriggerRef = useRef(false);

  // Weather-linked auto plan trigger
  useEffect(() => {
    if (autoTriggerRef.current) return;
    if (!emergency.activePlan && emergency.typhoon.distance < 50 && emergency.typhoon.windLevel >= 10) {
      autoTriggerRef.current = true;
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setEmergencyState({
        communications: [
          ...emergency.communications,
          {
            id: `ec-auto-${Date.now()}`,
            type: 'system' as const,
            source: '系统',
            time: timeStr,
            content: `气象联动：台风距离 ${emergency.typhoon.distance}km，风力 ${emergency.typhoon.windLevel} 级，建议立即启动应急预案`,
            urgent: true,
          },
        ],
      });
      setActiveModal('plan-library');
    }
  }, [emergency.typhoon.distance, emergency.typhoon.windLevel, emergency.activePlan]);

  useEffect(() => {
    const interval = setInterval(() => {
      const forecast = emergency.forecast;
      const peak = forecast.peakStrandedVehicles;
      const newCurrent = Math.min(peak, forecast.currentStrandedVehicles + Math.floor(Math.random() * 20 + 10));
      const newColdChain = Math.min(200, forecast.coldChainVehicles + (Math.random() > 0.66 ? 1 : 0));
      const newDistance = Math.max(0, emergency.typhoon.distance - 0.5);

      const updatedVehicles = emergency.specialVehicles.map((v) => {
        const newHours = +(v.strandedHours + 0.08).toFixed(2);
        const newFuel = v.fuelLevel !== undefined ? Math.max(0, v.fuelLevel - 0.1) : undefined;
        return {
          ...v,
          strandedHours: newHours,
          alertLevel: v.type === 'cold_chain' ? getAlertLevel(newHours) : v.alertLevel,
          fuelLevel: newFuel !== undefined ? Math.round(newFuel * 10) / 10 : undefined,
        };
      });

      const shouldSuggestExit =
        emergency.forecast.currentStrandedVehicles < 200 &&
        emergency.forecast.strandedPhase === 'recovery' &&
        emergency.typhoon.distance > 120;

      const updatedComms = [...emergency.communications];
      if (shouldSuggestExit && !updatedComms.some((c) => c.content.includes('应急状态已解除'))) {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        updatedComms.push({
          id: `ec-exit-${Date.now()}`,
          type: 'system' as const,
          source: '系统',
          time: timeStr,
          content: '应急状态已解除，建议切换回总览模式',
          urgent: false,
        });
      }

      setEmergencyState({
        forecast: {
          ...forecast,
          currentStrandedVehicles: newCurrent,
          coldChainVehicles: newColdChain,
        },
        typhoon: {
          ...emergency.typhoon,
          distance: Math.round(newDistance * 10) / 10,
        },
        timeline: buildEmergencyTimeline(newCurrent, peak),
        specialVehicles: updatedVehicles,
        communications: updatedComms,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [emergency, setEmergencyState]);

  return null;
}

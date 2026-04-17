import { useEffect } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import { buildEmergencyTimeline } from '../../utils/emergencyEngine';

export default function EmergencySimulator() {
  const emergency = useDashboardStore((s) => s.emergencyState);
  const setEmergencyState = useDashboardStore((s) => s.setEmergencyState);

  useEffect(() => {
    const interval = setInterval(() => {
      const forecast = emergency.forecast;
      const peak = forecast.peakStrandedVehicles;
      const newCurrent = Math.min(peak, forecast.currentStrandedVehicles + Math.floor(Math.random() * 20 + 10));
      const newColdChain = Math.min(200, forecast.coldChainVehicles + (Math.random() > 0.66 ? 1 : 0));
      const newDistance = Math.max(0, emergency.typhoon.distance - 0.5);

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
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [emergency, setEmergencyState]);

  return null;
}

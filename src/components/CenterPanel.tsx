import { useUIStore } from '../stores';
import HourlyChart from './HourlyChart';
import PressurePredictionChart from './overview/PressurePredictionChart';

interface CenterPanelProps {
  leftCollapsed?: boolean;
  rightCollapsed?: boolean;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
}

export default function CenterPanel(_props: CenterPanelProps) {
  const systemMode = useUIStore((s) => s.systemMode);

  // Only show in overview mode
  if (systemMode !== 'overview') {
    return null;
  }

  // Bottom charts only - map is now rendered full-screen in App.tsx
  return (
    <>
      <div style={{ flex: 1 }}>
        <PressurePredictionChart compact />
      </div>
      <div style={{ flex: 1 }}>
        <HourlyChart />
      </div>
    </>
  );
}

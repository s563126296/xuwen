import { useCommandStore, getCurrentExecutionPhase } from '../../stores/commandStore';
import { SelectingPhasePanel, ExecutingPhasePanel, CompletedPhasePanel } from './panels';

export default function StrategyCommandPanel() {
  const cmd = useCommandStore((s) => s.commandState);
  const phase = getCurrentExecutionPhase(cmd);

  if (phase === 'selecting') {
    return <SelectingPhasePanel />;
  }

  if (phase === 'executing') {
    return <ExecutingPhasePanel />;
  }

  if (phase === 'completed') {
    return <CompletedPhasePanel />;
  }

  return null;
}

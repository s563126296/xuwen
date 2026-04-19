import { EMERGENCY_PLANS } from '../../data/emergencyPlans';
import { useDashboardStore } from '../../store/dashboardStore';
import { playClickSound } from '../../utils/soundEffects';
import type { PlanId } from '../../store/dashboardStore';

interface Props {
  onClose: () => void;
}

export default function EmergencyPlanLibraryModal({ onClose }: Props) {
  const activatePlan = useDashboardStore((s) => s.activatePlan);

  const handleActivate = (planId: PlanId) => {
    playClickSound();
    activatePlan(planId);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: 600, maxHeight: '80vh',
        background: '#0D1B2A',
        border: '1px solid rgba(0,208,233,0.3)',
        borderRadius: 10,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>应急预案库</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>选择适用的应急预案</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748B', fontSize: 18, lineHeight: 1,
              padding: '4px 8px', borderRadius: 4,
            }}
          >✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '16px 26px 16px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {EMERGENCY_PLANS.map((plan) => (
              <div
                key={plan.id}
                style={{
                  padding: 14,
                  background: 'rgba(13,27,42,0.8)',
                  border: '1px solid rgba(0,208,233,0.15)',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {/* Plan name */}
                <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>
                  {plan.name}
                </div>

                {/* Scenario (1 line) */}
                <div style={{
                  fontSize: 11, color: '#94A3B8', lineHeight: 1.4,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {plan.scenario}
                </div>

                {/* Core measures as tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {plan.coreMeasures.map((measure, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 9, padding: '2px 6px', borderRadius: 3,
                        background: 'rgba(0,208,233,0.1)', color: '#00D0E9',
                        border: '1px solid rgba(0,208,233,0.2)',
                      }}
                    >{measure}</span>
                  ))}
                </div>

                {/* Activate button */}
                <button
                  onClick={() => handleActivate(plan.id as PlanId)}
                  style={{
                    fontSize: 11, padding: '6px 0', borderRadius: 5,
                    background: 'rgba(0,208,233,0.15)', border: '1px solid rgba(0,208,233,0.4)',
                    color: '#00D0E9', cursor: 'pointer', fontWeight: 600,
                    marginTop: 'auto',
                  }}
                >启动预案</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

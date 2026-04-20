import { playClickSound } from '../../../utils/soundEffects';
import { CUSTOM_TEMPLATES } from './strategyConstants';

export default function CustomStrategyGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {CUSTOM_TEMPLATES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => {
            playClickSound();
          }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            padding: '10px 6px', borderRadius: 6, cursor: 'pointer',
            background: 'rgba(13,27,42,0.6)',
            border: '1px solid rgba(0,208,233,0.1)',
            color: '#94A3B8', fontSize: 11,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,208,233,0.08)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,208,233,0.25)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(13,27,42,0.6)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,208,233,0.1)';
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Icon size={16} color="#00D0E9" />
          <span style={{ textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  status?: 'normal' | 'warning' | 'danger';
  accent?: boolean;
  hero?: boolean;
  fontSize?: number;
}

export default function KpiCard({
  label,
  value,
  unit = '',
  change,
  status,
  accent = false,
  hero = false,
  fontSize = 20,
}: KpiCardProps) {
  const glowClass = status === 'danger'
    ? 'glow-danger'
    : status === 'warning'
    ? ''
    : accent
    ? 'accent'
    : hero
    ? 'glow-primary'
    : '';

  const size = hero ? 32 : fontSize;
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div className={`kpi-card`}>
      <span className="kpi-label">{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {status && (
          <span className={`status-dot ${status} ${status === 'danger' ? 'pulse' : ''}`} />
        )}
        <span className={`kpi-value ${glowClass}`} style={{ fontSize: size }}>
          {displayValue}
          {unit && (
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 2 }}>
              {unit}
            </span>
          )}
        </span>
      </div>
      {change !== undefined && (
        <span className={`kpi-change ${change > 0 ? 'up' : 'down'}`}>
          {change > 0 ? '\u2191' : '\u2193'} {Math.abs(change)}%
        </span>
      )}
    </div>
  );
}

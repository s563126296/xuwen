import { useMemo } from 'react';

interface FlipNumberProps {
  value: number | string;
  digits?: number;
  unit?: string;
  style?: React.CSSProperties;
}

/**
 * Flip-card number display. Each digit is wrapped in .flip-digit
 * with a one-time top-down flip animation via CSS.
 */
export default function FlipNumber({ value, digits, unit, style }: FlipNumberProps) {
  const chars = useMemo(() => {
    let str = String(value);
    if (digits && digits > str.length) {
      str = str.padStart(digits, '0');
    }
    return str.split('');
  }, [value, digits]);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
      {chars.map((ch, i) => (
        <span
          key={`${i}-${ch}`}
          className="flip-digit"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          {ch}
        </span>
      ))}
      {unit && (
        <span style={{ fontSize: 14, color: 'var(--bs-text-secondary)', marginLeft: 4 }}>
          {unit}
        </span>
      )}
    </span>
  );
}

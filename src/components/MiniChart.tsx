interface Props {
  data: number[];
  color: string;
}

export function MiniChart({ data, color }: Props) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pathData = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 40 - ((val - min) / range) * 35;
      return `${i === 0 ? 'M' : 'T'}${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="mini-chart">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${pathData} L100 40 L0 40 Z`}
          fill={`url(#grad-${color.replace('#', '')})`}
        />
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      </svg>

      <style>{`
        .mini-chart {
          height: 40px;
          margin-top: 12px;
        }
        .mini-chart svg {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}

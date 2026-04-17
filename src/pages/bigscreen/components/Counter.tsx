import { useEffect, useState } from 'react';

interface CounterProps {
  value: string | number;
  duration?: number;
}

export default function Counter({ value, duration = 1000 }: CounterProps) {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;

    if (isNaN(numericValue)) {
      setDisplayValue(String(value));
      return;
    }

    const startValue = 0;
    const endValue = numericValue;
    const startTime = Date.now();
    const hasComma = typeof value === 'string' && value.includes(',');
    const hasDecimal = String(value).includes('.');
    const decimalPlaces = hasDecimal ? String(value).split('.')[1]?.length || 1 : 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuad = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOutQuad;

      let formatted = hasDecimal ? current.toFixed(decimalPlaces) : Math.round(current).toString();
      if (hasComma) {
        formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      setDisplayValue(formatted);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value, duration]);

  return <span className="bs-kpi-value">{displayValue}</span>;
}

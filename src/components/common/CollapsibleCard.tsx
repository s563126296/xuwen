import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleCardProps {
  /** Card title */
  title: string;
  /** Icon element */
  icon?: ReactNode;
  /** Summary content shown when collapsed */
  summary: ReactNode;
  /** Full content shown when expanded */
  children: ReactNode;
  /** Animation delay */
  delay?: string;
  /** Default expanded state */
  defaultExpanded?: boolean;
  /** Accent color for glow */
  accent?: boolean;
}

export default function CollapsibleCard({
  title,
  icon,
  summary,
  children,
  delay = '0s',
  defaultExpanded = false,
  accent = false,
}: CollapsibleCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded]);

  return (
    <div
      className={`module-card animate-in ${accent ? 'glow-accent' : ''}`}
      style={{ animationDelay: delay, cursor: 'pointer', transition: 'border-color 0.2s ease' }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {icon}
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
        </div>
        {expanded ? <ChevronUp size={12} color="var(--text-tertiary, #A0A8B4)" /> : <ChevronDown size={12} color="var(--text-tertiary, #A0A8B4)" />}
      </div>

      {/* Summary - always visible */}
      <div style={{ marginTop: 4 }}>
        {summary}
      </div>

      {/* Expandable content */}
      <div
        ref={contentRef}
        style={{
          maxHeight: expanded ? contentHeight : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div style={{ paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 6 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

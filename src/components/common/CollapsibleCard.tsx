import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleCardProps {
  title: string;
  icon?: ReactNode;
  summary: ReactNode;
  children: ReactNode;
  delay?: string;
  defaultExpanded?: boolean;
  accent?: boolean;
  /** 受控模式：外部控制展开状态 */
  expanded?: boolean;
  /** 受控模式：外部切换回调 */
  onToggle?: () => void;
}

export default function CollapsibleCard({
  title,
  icon,
  summary,
  children,
  delay = '0s',
  defaultExpanded = false,
  accent = false,
  expanded: controlledExpanded,
  onToggle,
}: CollapsibleCardProps) {
  const isControlled = controlledExpanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded]);

  const handleClick = () => {
    if (isControlled && onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  return (
    <div
      className={`module-card animate-in ${accent ? 'glow-accent' : ''}`}
      style={{ animationDelay: delay, cursor: 'pointer', transition: 'border-color 0.2s ease' }}
      onClick={handleClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {icon}
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
        </div>
        {expanded ? <ChevronUp size={12} color="var(--text-tertiary, #A0A8B4)" /> : <ChevronDown size={12} color="var(--text-tertiary, #A0A8B4)" />}
      </div>

      <div style={{ marginTop: 4 }}>
        {summary}
      </div>

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

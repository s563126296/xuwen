import React, { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface GlassPanelProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  expandable?: boolean;
  panelKey?: string;
  help?: string;
  alertLevel?: 'none' | 'warning' | 'danger';
  className?: string;
  children: React.ReactNode;
}

export default function GlassPanel({
  title,
  icon,
  badge,
  expandable = false,
  alertLevel = 'none',
  className = '',
  children,
}: GlassPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const alertClass =
    alertLevel === 'danger'
      ? 'alert-danger'
      : alertLevel === 'warning'
      ? 'alert-warning'
      : '';

  return (
    <div
      className={`glass-panel ${alertClass} ${className}`}
      style={{ animation: 'panel-enter 700ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both' }}
    >
      <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 8px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <span className="panel-title" style={{ fontSize: 12, letterSpacing: '1px', margin: 0 }}>{title}</span>
          {badge && <span className="panel-title-badge">{badge}</span>}
        </div>
        {expandable && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ padding: 4, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary, rgba(140,160,180,0.45))' }}
          >
            {collapsed ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </button>
        )}
      </div>
      {!collapsed && (
        <div className="panel-body" style={{ padding: '8px 16px 12px' }}>{children}</div>
      )}
    </div>
  );
}

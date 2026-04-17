interface PanelFrameProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Unified panel container with mecha cockpit styling.
 * Renders .bs-panel with diamond-anchor title bar and corner decorations.
 */
export default function PanelFrame({ title, children, className, style }: PanelFrameProps) {
  return (
    <div className={`bs-panel${className ? ` ${className}` : ''}`} style={style}>
      <div className="bs-panel-title">{title}</div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

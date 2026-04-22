import { AlertTriangle, TrendingUp, GitBranch } from 'lucide-react';
import { getAllElements } from '../../../data/aiAnalysisData';

interface AnalysisElementListProps {
  onElementClick?: (elementId: string) => void;
  selectedElementId?: string;
}

export default function AnalysisElementList({ onElementClick, selectedElementId }: AnalysisElementListProps) {
  const elements = getAllElements();

  const getIcon = (type: string) => {
    switch (type) {
      case 'problem':
        return <AlertTriangle size={14} />;
      case 'risk':
        return <AlertTriangle size={14} />;
      case 'prediction':
        return <TrendingUp size={14} />;
      case 'causal':
        return <GitBranch size={14} />;
      default:
        return <AlertTriangle size={14} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'problem':
        return '#FF4757';
      case 'risk':
        return '#F5A623';
      case 'prediction':
        return '#7C5CFC';
      case 'causal':
        return '#00D0E9';
      default:
        return '#00D0E9';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '严重';
      case 'high':
        return '高';
      case 'medium':
        return '中';
      default:
        return '';
    }
  };

  const getElementValue = (element: any) => {
    if ('value' in element) return element.value;
    if ('level' in element) return getSeverityLabel(element.level);
    return '';
  };

  const getElementSeverity = (element: any) => {
    if ('severity' in element) return element.severity;
    if ('level' in element) return element.level;
    return null;
  };

  return (
    <div className="analysis-element-list">
      {elements.map((element) => {
        const severity = getElementSeverity(element);
        const value = getElementValue(element);

        return (
          <div
            key={element.id}
            className={`analysis-element-item ${selectedElementId === element.id ? 'selected' : ''}`}
            onClick={() => onElementClick?.(element.id)}
            style={{ borderLeftColor: getTypeColor(element.type) }}
          >
            <div className="analysis-element-item__header">
              <div className="analysis-element-item__icon" style={{ color: getTypeColor(element.type) }}>
                {getIcon(element.type)}
              </div>
              <div className="analysis-element-item__title">
                <span className="analysis-element-item__category">{element.category}</span>
                <h4>{element.name}</h4>
              </div>
              {severity && (
                <span className={`analysis-element-item__severity analysis-element-item__severity--${severity}`}>
                  {getSeverityLabel(severity)}
                </span>
              )}
            </div>
            {value && <div className="analysis-element-item__value">{value}</div>}
          </div>
        );
      })}
    </div>
  );
}

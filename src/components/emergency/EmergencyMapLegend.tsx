export default function EmergencyMapLegend() {
  return (
    <div className="emergency-map-legend">
      <div className="emergency-map-legend__item">
        <div className="emergency-map-legend__line" style={{ background: '#FF4757' }} />
        <span className="emergency-map-legend__text">滞留主链</span>
      </div>
      <div className="emergency-map-legend__item">
        <div className="emergency-map-legend__dash" style={{ color: '#F5A623' }} />
        <span className="emergency-map-legend__text">停车分拨</span>
      </div>
      <div className="emergency-map-legend__item">
        <div className="emergency-map-legend__dash" style={{ color: '#2ED573' }} />
        <span className="emergency-map-legend__text">物资配送</span>
      </div>
      <div className="emergency-map-legend__item">
        <div className="emergency-map-legend__dot" style={{ background: '#FF4757' }} />
        <span className="emergency-map-legend__text">特殊车辆</span>
      </div>
    </div>
  );
}

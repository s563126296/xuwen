export default function CommandMapLegend() {
  const legendItems = [
    { label: '主拥堵链', color: '#FF4757', type: 'line' },
    { label: '停车分拨', color: '#2ED573', type: 'dash' },
    { label: '物资配送', color: '#F5A623', type: 'dash' },
    { label: '特殊车辆', color: '#60A5FA', type: 'dot' },
  ];

  return (
    <div className="command-map-legend">
      {legendItems.map((item) => (
        <div key={item.label} className="command-map-legend__item">
          {item.type === 'line' && (
            <div className="command-map-legend__line" style={{ background: item.color }} />
          )}
          {item.type === 'dash' && (
            <div className="command-map-legend__dash" style={{ background: item.color }} />
          )}
          {item.type === 'dot' && (
            <div className="command-map-legend__dot" style={{ background: item.color }} />
          )}
          <span className="command-map-legend__text">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

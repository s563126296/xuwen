interface PortData {
  name: string;
  flow: number;
  status: 'normal' | 'busy' | 'congested';
}

interface Props {
  data: PortData[];
}

export function PortChart({ data }: Props) {
  const max = Math.max(...data.map(d => d.flow));

  return (
    <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', gap: 12, padding: '8px 0' }}>
      {data.map((port, index) => (
        <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '100%',
            height: `${(port.flow / max) * 80}px`,
            background: port.status === 'normal'
              ? 'linear-gradient(180deg, #2ED573 0%, rgba(46, 213, 115, 0.3) 100%)'
              : port.status === 'busy'
              ? 'linear-gradient(180deg, #F5A623 0%, rgba(245, 166, 35, 0.3) 100%)'
              : 'linear-gradient(180deg, #FF4757 0%, rgba(255, 71, 87, 0.3) 100%)',
            borderRadius: '6px 6px 0 0',
            transition: 'height 0.3s ease',
            boxShadow: `0 0 20px ${port.status === 'normal' ? 'rgba(46, 213, 115, 0.3)' : port.status === 'busy' ? 'rgba(245, 166, 35, 0.3)' : 'rgba(255, 71, 87, 0.3)'}`
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: 8
            }}>
              <span style={{
                fontFamily: 'DIN, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: '#FFFFFF'
              }}>
                {Math.round(port.flow / 1000)}k
              </span>
            </div>
          </div>
          <div style={{
            marginTop: 8,
            fontSize: 11,
            color: '#A0A8B4',
            textAlign: 'center'
          }}>
            {port.name.replace('港', '')}
          </div>
        </div>
      ))}
    </div>
  );
}

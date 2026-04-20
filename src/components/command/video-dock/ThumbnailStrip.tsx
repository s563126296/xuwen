interface Camera {
  id: string;
  name: string;
  status: string;
}

interface ThumbnailStripProps {
  cameras: Camera[];
  activeChannel: number;
  isDroneDeployed: boolean;
  onCameraClick: (index: number) => void;
  onDroneClick: () => void;
}

export default function ThumbnailStrip({
  cameras,
  activeChannel,
  isDroneDeployed,
  onCameraClick,
  onDroneClick,
}: ThumbnailStripProps) {
  const isDroneView = isDroneDeployed && activeChannel === 5;

  return (
    <div style={{
      display: 'flex',
      gap: 6,
      marginTop: 8,
      marginBottom: 8
    }}>
      {cameras.map((cam, index) => (
        <div
          key={cam.id}
          onClick={() => onCameraClick(index)}
          style={{
            flex: 1,
            height: 36,
            borderRadius: 4,
            background: 'rgba(0,0,0,0.6)',
            border: activeChannel === index ? '1px solid #00D0E9' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 600,
            color: activeChannel === index ? '#00D0E9' : '#64748B',
            opacity: isDroneView ? 0.4 : 1,
            transition: 'all 0.2s'
          }}
        >
          {cam.id.split('-')[1]}
        </div>
      ))}
      {isDroneDeployed && (
        <div
          onClick={onDroneClick}
          style={{
            flex: 1,
            height: 36,
            borderRadius: 4,
            background: 'rgba(0,0,0,0.6)',
            border: isDroneView ? '1px solid #00D0E9' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 600,
            color: isDroneView ? '#00D0E9' : '#64748B',
            transition: 'all 0.2s'
          }}
        >
          UAV
        </div>
      )}
    </div>
  );
}

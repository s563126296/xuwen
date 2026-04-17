interface CameraData {
  id: string;
  name: string;
  location: string;
  online: boolean;
}

interface Props {
  cameras: CameraData[];
}

export default function CameraCard({ cameras }: Props) {
  return (
    <div className="card camera-card animate-in delay-5">
      <div className="card-header">
        <span className="card-title">监控摄像头</span>
        <div className="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 7l-7 5 7 5V7z"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </div>
      </div>
      <div className="camera-list">
        {cameras.map((camera) => (
          <div key={camera.id} className="camera-item">
            <div className="camera-thumb">
              <div className="camera-play" />
            </div>
            <div className="camera-info">
              <div className="camera-name">{camera.name}</div>
              <div className="camera-location">{camera.location}</div>
            </div>
            <div className={`camera-status ${camera.online ? 'online' : 'offline'}`} />
          </div>
        ))}
      </div>

      <style>{`
        .camera-list { display: flex; flex-direction: column; gap: 12px; }
        .camera-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 10px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .camera-item:hover { background: var(--bg-card-hover); }
        .camera-thumb {
          width: 64px;
          height: 40px;
          background: linear-gradient(135deg, #1a2636 0%, #0a0e14 100%);
          border-radius: 6px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .camera-play {
          width: 0;
          height: 0;
          border-left: 8px solid rgba(255,255,255,0.6);
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
        }
        .camera-info { flex: 1; }
        .camera-name { font-size: 13px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px; }
        .camera-location { font-size: 11px; color: var(--text-secondary); }
        .camera-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .camera-status.online {
          background: var(--accent-success);
          box-shadow: 0 0 8px var(--accent-success);
        }
        .camera-status.offline {
          background: var(--accent-danger);
          box-shadow: 0 0 8px var(--accent-danger);
        }
      `}</style>
    </div>
  );
}

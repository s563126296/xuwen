import Modal from '../Modal';
import { Camera } from 'lucide-react';

export default function PhotoViewerModal() {
  return (
    <Modal id="photo-viewer" title="现场照片" width={600}>
      <div style={{
        height: 320,
        background: 'linear-gradient(180deg, #0A1929 0%, #1A2332 100%)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}>
        {/* Camera Icon */}
        <Camera size={48} color="#F5A623" />

        {/* Info Line 1 */}
        <div style={{
          fontSize: 14,
          color: '#E2E8F0',
          fontWeight: 500,
        }}>
          张三 · S376 路口 · 15:32
        </div>

        {/* Info Line 2 */}
        <div style={{
          fontSize: 13,
          color: '#94A3B8',
          textAlign: 'center',
          maxWidth: 400,
        }}>
          分流车辆正常通行，车流量已明显下降
        </div>
      </div>
    </Modal>
  );
}

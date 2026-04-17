import Modal from '../Modal';
import { TrendingUp, Clock, Car, AlertTriangle } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

export default function CongestionDetailModal() {
  const cmd = useDashboardStore((s) => s.commandState);

  return (
    <Modal
      id="congestion-detail"
      title="进港大道拥堵态势"
      width={500}
    >
      <div style={{ padding: '16px 0' }}>
        {/* 当前状态 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 12 }}>
            当前状态
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{
              padding: 12,
              background: 'rgba(255,71,87,0.1)',
              border: '1px solid rgba(255,71,87,0.2)',
              borderRadius: 6,
            }}>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>拥堵指数</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#FF4757' }}>
                {cmd.congestionIndex.toFixed(1)}
              </div>
            </div>
            <div style={{
              padding: 12,
              background: 'rgba(0,208,233,0.1)',
              border: '1px solid rgba(0,208,233,0.2)',
              borderRadius: 6,
            }}>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>排队长度</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#00D0E9' }}>
                {cmd.congestionDist}
              </div>
            </div>
          </div>
        </div>

        {/* 详细信息 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 12 }}>
            详细信息
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="#94A3B8" />
              <span style={{ fontSize: 12, color: '#94A3B8' }}>持续时长：</span>
              <span style={{ fontSize: 12, color: '#E2E8F0' }}>{cmd.congestionTime} 分钟</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Car size={16} color="#94A3B8" />
              <span style={{ fontSize: 12, color: '#94A3B8' }}>排队车辆：</span>
              <span style={{ fontSize: 12, color: '#E2E8F0' }}>约 {Math.round(cmd.congestionIndex * 150)} 辆</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} color="#94A3B8" />
              <span style={{ fontSize: 12, color: '#94A3B8' }}>拥堵趋势：</span>
              <span style={{ fontSize: 12, color: '#FF4757' }}>持续上升</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="#94A3B8" />
              <span style={{ fontSize: 12, color: '#94A3B8' }}>影响范围：</span>
              <span style={{ fontSize: 12, color: '#E2E8F0' }}>G207 至徐闻港全线</span>
            </div>
          </div>
        </div>

        {/* 路段分析 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 12 }}>
            路段分析
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: '城区路口', status: '畅通', color: '#2ED573' },
              { name: '华四村', status: '缓行', color: '#F5A623' },
              { name: '迈陈镇', status: '拥堵', color: '#FF8C00' },
              { name: '南山镇', status: '严重拥堵', color: '#FF4757' },
              { name: '近港区', status: '极度拥堵', color: '#DC143C' },
            ].map((segment) => (
              <div
                key={segment.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(10,15,25,0.6)',
                  borderRadius: 4,
                }}
              >
                <span style={{ fontSize: 12, color: '#E2E8F0' }}>{segment.name}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: segment.color,
                    padding: '2px 8px',
                    background: `${segment.color}20`,
                    borderRadius: 4,
                  }}
                >
                  {segment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

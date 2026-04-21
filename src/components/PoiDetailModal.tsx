import { Anchor, Building2, Clock, MapPin, Route, Ship } from 'lucide-react';
import Modal from './Modal';
import { useOverviewStore, useUIStore } from '../stores';
import keyPois from '../data/geo/keyPois.json';
import type { PortType } from '../stores/types';

type DigestionPort = Extract<PortType, 'xuwen' | 'haian'>;

const CATEGORY_LABELS: Record<string, string> = {
  port: '港口',
  terminal: '码头',
  dispatch: '调度中心',
  service: '服务点',
};

const SCOPE_TO_PORT: Partial<Record<string, DigestionPort>> = {
  xuwen: 'xuwen',
  haian: 'haian',
};

function getPoiDescription(category: string) {
  if (category === 'port') return '海峡通行核心节点，关联排队车辆、港区消化能力和通航状态。';
  if (category === 'terminal') return '轮渡/铁路码头节点，关联航线衔接和港区接驳能力。';
  if (category === 'dispatch') return '现场调度与多部门协同节点，可联动指挥策略和应急响应。';
  return '交通服务与保障节点，可用于分流引导、旅客服务和现场支撑。';
}

function MetricCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div style={{
      padding: 12,
      background: 'rgba(0,0,0,0.22)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 6,
    }}>
      <div style={{ fontSize: 11, color: '#A0A8B4', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'DIN, JetBrains Mono, monospace', fontSize: 22, color: '#00D0E9', fontWeight: 700 }}>
        {value}
        {unit && <span style={{ fontSize: 11, color: '#A0A8B4', marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  );
}

export default function PoiDetailModal() {
  const selectedEntity = useUIStore((s) => s.selectedEntity);
  const portData = useOverviewStore((s) => s.portData);
  const portDigestion = useOverviewStore((s) => s.portDigestion);
  const poi = selectedEntity?.type === 'poi'
    ? keyPois.find((item) => item.id === selectedEntity.id)
    : undefined;

  const category = poi?.category ?? 'port';
  const targetPort = poi?.scope ? SCOPE_TO_PORT[poi.scope] : undefined;
  const selectedPortData = targetPort ? portData[targetPort] : undefined;
  const selectedDigestion = targetPort ? portDigestion[targetPort] : undefined;
  const title = poi ? `${CATEGORY_LABELS[category] || 'POI'}详情` : 'POI详情';

  return (
    <Modal id="poi-detail" title={title} width={520}>
      {!poi ? (
        <div style={{ color: '#A0A8B4', fontSize: 13 }}>未找到点位数据。</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            padding: 14,
            background: 'rgba(0,208,233,0.06)',
            border: '1px solid rgba(0,208,233,0.16)',
            borderRadius: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {category === 'port' || category === 'terminal' ? <Ship size={18} color="#F5A623" /> : <Building2 size={18} color="#00D0E9" />}
              <span style={{ fontSize: 17, fontWeight: 700, color: '#FFF' }}>{poi.name}</span>
              <span style={{
                marginLeft: 'auto',
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(245,166,35,0.12)',
                color: '#F5A623',
                fontSize: 11,
                fontWeight: 600,
              }}>
                {CATEGORY_LABELS[category] || category}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#A0A8B4', fontSize: 12 }}>
              <MapPin size={13} />
              <span>{poi.lng.toFixed(5)}, {poi.lat.toFixed(5)}</span>
            </div>
            <div style={{ marginTop: 10, color: '#C9CDD4', fontSize: 13, lineHeight: 1.6 }}>
              {getPoiDescription(category)}
            </div>
          </div>

          {selectedPortData && selectedDigestion && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <MetricCard label="当前流量" value={selectedPortData.vehicleFlow} unit="辆/时" />
              <MetricCard label="待舶车辆" value={selectedDigestion.waitingVehicles} unit="辆" />
              <MetricCard label="消化时间" value={(selectedDigestion.digestionMinutes / 60).toFixed(1)} unit="h" />
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderRadius: 6, background: 'rgba(255,255,255,0.04)' }}>
              <Anchor size={15} color="#F5A623" />
              <span style={{ fontSize: 12, color: '#C9CDD4' }}>可联动港口消化与通航状态</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderRadius: 6, background: 'rgba(255,255,255,0.04)' }}>
              <Route size={15} color="#00D0E9" />
              <span style={{ fontSize: 12, color: '#C9CDD4' }}>可联动周边道路与分流策略</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderRadius: 6, background: 'rgba(255,255,255,0.04)' }}>
              <Clock size={15} color="#2ED573" />
              <span style={{ fontSize: 12, color: '#C9CDD4' }}>数据刷新周期 5 分钟</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderRadius: 6, background: 'rgba(255,255,255,0.04)' }}>
              <MapPin size={15} color="#A78BFA" />
              <span style={{ fontSize: 12, color: '#C9CDD4' }}>坐标系 GCJ-02 渲染</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

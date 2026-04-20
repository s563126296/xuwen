import { useEmergencyStore } from '../../stores/emergencyStore';
import { useUIStore } from '../../stores/uiStore';
import { estimateSupplyDemand } from '../../utils/emergencyEngine';
import { playClickSound } from '../../utils/soundEffects';

interface Props {
  onClose: () => void;
}

export default function EmergencyReportModal({ onClose }: Props) {
  const emergency = useEmergencyStore((s) => s.emergencyState);
  const setSystemMode = useUIStore((s) => s.setSystemMode);
  const { forecast, tasks, communications } = emergency;
  const { strandedPeople, boxedMeals, waterBoxes } = estimateSupplyDemand(forecast.currentStrandedVehicles);

  // Supply items summary
  const supplyItems = [
    { label: '盒饭', available: 8000, demand: boxedMeals, unit: '份' },
    { label: '饮用水', available: 1000, demand: waterBoxes, unit: '箱' },
    { label: '雨衣', available: 2000, demand: Math.round(strandedPeople * 0.5), unit: '件' },
    { label: '毛毯', available: 800, demand: Math.round(strandedPeople * 0.3), unit: '条' },
  ];

  // Task completion by department
  const deptMap: Record<string, { total: number; done: number }> = {};
  tasks.forEach((t) => {
    if (!deptMap[t.department]) deptMap[t.department] = { total: 0, done: 0 };
    deptMap[t.department].total++;
    if (t.status === 'done') deptMap[t.department].done++;
  });

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: 600, maxHeight: '80vh',
        background: '#0D1B2A',
        border: '1px solid rgba(255,71,87,0.3)',
        borderRadius: 10,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>应急处置报告</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>自动生成 · 实时数据</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748B', fontSize: 18, lineHeight: 1,
              padding: '4px 8px', borderRadius: 4,
            }}
          >✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '16px 26px 16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 事件概况 */}
          <section>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#FF4757', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>事件概况</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '台风名称', value: `台风"${emergency.typhoon.name}"` },
                { label: '停航时间', value: emergency.shutdownStartTime },
                { label: '响应等级', value: `${emergency.emergencyLevel}级响应` },
                { label: '当前阶段', value: emergency.phaseLabel },
              ].map((item) => (
                <div key={item.label} style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 10, color: '#64748B' }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 600, marginTop: 2 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 滞留统计 */}
          <section>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#F5A623', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>滞留统计</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '当前滞留', value: `${forecast.currentStrandedVehicles} 辆` },
                { label: '峰值预测', value: `${forecast.peakStrandedVehicles} 辆` },
                { label: '冷链车', value: `${forecast.coldChainVehicles} 辆` },
                { label: '危化品车', value: `${forecast.hazardousVehicles} 辆` },
              ].map((item) => (
                <div key={item.label} style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 10, color: '#64748B' }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 600, marginTop: 2 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 物资保障 */}
          <section>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#2ED573', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>物资保障</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {supplyItems.map((item) => {
                const ratio = Math.min(item.available / Math.max(item.demand, 1), 1);
                const pct = Math.round(ratio * 100);
                const color = pct >= 80 ? '#2ED573' : pct >= 50 ? '#F5A623' : '#FF4757';
                return (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: '#94A3B8', width: 60 }}>{item.label}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color }} />
                    </div>
                    <span style={{ fontSize: 11, color, width: 36, textAlign: 'right' }}>{pct}%</span>
                    <span style={{ fontSize: 10, color: '#64748B', width: 80, textAlign: 'right' }}>
                      {item.available.toLocaleString()}/{item.demand.toLocaleString()}{item.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 任务执行 */}
          <section>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#00D0E9', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>任务执行</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(deptMap).map(([dept, stat]) => {
                const pct = stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0;
                return (
                  <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: '#94A3B8', width: 80 }}>{dept}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: '#00D0E9' }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#00D0E9', width: 36, textAlign: 'right' }}>{pct}%</span>
                    <span style={{ fontSize: 10, color: '#64748B', width: 50, textAlign: 'right' }}>{stat.done}/{stat.total}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 关键时间节点 */}
          <section>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>关键时间节点</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {communications.map((comm) => (
                <div key={comm.id} style={{ display: 'flex', gap: 10, fontSize: 11 }}>
                  <span style={{ color: '#F5A623', flexShrink: 0, width: 36 }}>{comm.time}</span>
                  <span style={{ color: '#64748B', flexShrink: 0, width: 60 }}>[{comm.source}]</span>
                  <span style={{ color: '#CBD5E1' }}>{comm.content}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer: export */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => {
              const lines: string[] = [];
              lines.push('# 应急处置报告');
              lines.push(`台风"${emergency.typhoon.name}" · ${emergency.emergencyLevel}级响应 · ${emergency.phaseLabel}`);
              lines.push(`停航时间: ${emergency.shutdownStartTime} · 当前滞留: ${forecast.currentStrandedVehicles}辆 · 峰值: ${forecast.peakStrandedVehicles}辆`);
              lines.push(`冷链车: ${forecast.coldChainVehicles}辆 · 危化品车: ${forecast.hazardousVehicles}辆`);
              lines.push('');
              lines.push('## 物资保障');
              supplyItems.forEach((item) => {
                const pct = Math.round(Math.min(item.available / Math.max(item.demand, 1), 1) * 100);
                lines.push(`${item.label}: ${item.available.toLocaleString()}/${item.demand.toLocaleString()}${item.unit} (${pct}%)`);
              });
              lines.push('');
              lines.push('## 任务执行');
              Object.entries(deptMap).forEach(([dept, stat]) => {
                lines.push(`${dept}: ${stat.done}/${stat.total} 完成`);
              });
              lines.push('');
              lines.push('## 事件日志');
              communications.forEach((c) => {
                lines.push(`${c.time} [${c.source}] ${c.content}`);
              });
              const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `应急处置报告_${new Date().toISOString().slice(0, 10)}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              fontSize: 12, padding: '8px 20px', borderRadius: 6, cursor: 'pointer',
              background: 'rgba(0,208,233,0.12)', border: '1px solid #00D0E9', color: '#00D0E9',
            }}
          >
            导出事件日志
          </button>
          <button
            onClick={() => {
              playClickSound();
              setSystemMode('overview');
              onClose();
            }}
            style={{
              fontSize: 12, padding: '8px 20px', borderRadius: 6, cursor: 'pointer',
              background: 'rgba(46,213,115,0.12)', border: '1px solid #2ED573', color: '#2ED573',
            }}
          >
            返回总览模式
          </button>
          <button
            onClick={onClose}
            style={{
              fontSize: 12, padding: '8px 20px', borderRadius: 6, cursor: 'pointer',
              background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.3)', color: '#94A3B8',
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Camera, TrendingUp, Clock, Gauge, Video, X, Monitor, Type, ImageIcon, Plane, Battery, Signal, MapPin, Wind, Thermometer, AlertTriangle, BarChart3, Timer } from 'lucide-react';
import Modal from './Modal';
import { useDashboardStore } from '../store/dashboardStore';

// ============ 模拟视频画面组件 ============
function MockVideoFeed({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ height: 260, background: '#000', borderRadius: 10, border: '1px solid rgba(0,208,233,0.3)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #0A1929 0%, #1A2332 100%)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(0,208,233,0.6)', animation: 'scanline 3s linear infinite', boxShadow: '0 0 10px rgba(0,208,233,0.8)' }} />
        <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.15 }}>
          <defs><pattern id="vGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,208,233,0.3)" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#vGrid)" />
        </svg>
        <div style={{ position: 'absolute', top: 80, left: 120, width: 80, height: 50, border: '2px solid #00D0E9', borderRadius: 4 }}>
          <div style={{ position: 'absolute', top: -18, left: 0, fontSize: 11, color: '#00D0E9', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: 3 }}>粤G·A2891</div>
        </div>
        <div style={{ position: 'absolute', top: 120, left: 300, width: 70, height: 45, border: '2px solid #2ED573', borderRadius: 4 }}>
          <div style={{ position: 'absolute', top: -18, left: 0, fontSize: 11, color: '#2ED573', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: 3 }}>琼B·C0412</div>
        </div>
        <div style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, color: '#00D0E9', fontFamily: 'monospace', background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 4 }}>
          {title} | {new Date().toLocaleTimeString('zh-CN', { hour12: false })}
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, color: '#FF4757', fontFamily: 'monospace', background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF4757', animation: 'blink 1s infinite' }} />REC
        </div>
      </div>
      <button aria-label="关闭弹窗" onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, padding: 6, cursor: 'pointer', display: 'flex', zIndex: 10 }}>
        <X size={14} color="#C9CDD4" />
      </button>
      <style>{`@keyframes scanline { 0% { top: 0; } 100% { top: 100%; } } @keyframes blink { 0%,50% { opacity:1; } 51%,100% { opacity:0.3; } }`}</style>
    </div>
  );
}

// ============ 视频占位组件 ============
function VideoPlaceholder({ onOpen }: { onOpen: () => void }) {
  return (
    <div role="button" tabIndex={0} aria-label="查看实时视频" onClick={onOpen} style={{ height: 140, background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid rgba(0,208,233,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,208,233,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,208,233,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = 'rgba(0,208,233,0.15)'; }}>
      <Video size={28} color="#A0A8B4" />
      <span style={{ fontSize: 12, color: '#A0A8B4' }}>点击查看实时视频</span>
    </div>
  );
}

// ============ 指标卡片 ============
function MetricCard({ icon: IconComp, label, value, unit, color }: { icon: any; label: string; value: string | number; unit?: string; color: string }) {
  return (
    <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <IconComp size={13} color="#A0A8B4" />
        <span style={{ fontSize: 11, color: '#A0A8B4' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'DIN, sans-serif', fontSize: 24, fontWeight: 700, color }}>
        {value}{unit && <span style={{ fontSize: 11, color: '#A0A8B4', marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

// ============ 卡口设备详情 ============
function CheckpointContent({ name, videoOpen, setVideoOpen }: { name: string; videoOpen: boolean; setVideoOpen: (v: boolean) => void }) {
  const weekData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const weekValues = [3200, 2800, 3100, 2950, 3400, 5800, 6200];
  const maxVal = Math.max(...weekValues);
  return (
    <>
      {videoOpen ? <MockVideoFeed title={name} onClose={() => setVideoOpen(false)} /> : <VideoPlaceholder onOpen={() => setVideoOpen(true)} />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <MetricCard icon={TrendingUp} label="今日车流" value="4,862" unit="辆" color="#00D0E9" />
        <MetricCard icon={Gauge} label="平均车速" value="35" unit="km/h" color="#C9CDD4" />
        <MetricCard icon={Clock} label="拥堵时长" value="8" unit="分钟" color="#F5A623" />
        <MetricCard icon={BarChart3} label="拥堵指数" value="2.8" color="#F5A623" />
      </div>
      {/* 车型分布 */}
      <div style={{ padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 12, color: '#A0A8B4', marginBottom: 10 }}>今日车型分布</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[{ label: '小汽车', count: 3420, pct: 70, color: '#00D0E9' }, { label: '货车', count: 890, pct: 18, color: '#F5A623' }, { label: '冷链车', count: 312, pct: 6, color: '#4A90D9' }, { label: '危化品', count: 48, pct: 1, color: '#FF4757' }, { label: '其他', count: 192, pct: 5, color: '#A0A8B4' }].map((v, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: 'DIN, monospace', fontSize: 16, fontWeight: 700, color: v.color }}>{v.count}</div>
              <div style={{ fontSize: 11, color: '#A0A8B4', marginTop: 2 }}>{v.label} ({v.pct}%)</div>
            </div>
          ))}
        </div>
      </div>
      {/* 近一周车流趋势 */}
      <div style={{ padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 12, color: '#A0A8B4', marginBottom: 10 }}>近一周车流趋势</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
          {weekData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#C9CDD4', fontFamily: 'DIN, monospace' }}>{(weekValues[i] / 1000).toFixed(1)}k</span>
              <div style={{ width: '100%', height: `${(weekValues[i] / maxVal) * 45}px`, background: i >= 5 ? '#F5A623' : '#00D0E9', borderRadius: 3, minHeight: 4, transition: 'height 0.3s' }} />
              <span style={{ fontSize: 11, color: '#A0A8B4' }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ============ 违停抓拍详情 ============
function ParkingContent({ name, videoOpen, setVideoOpen }: { name: string; videoOpen: boolean; setVideoOpen: (v: boolean) => void }) {
  return (
    <>
      {videoOpen ? <MockVideoFeed title={name} onClose={() => setVideoOpen(false)} /> : <VideoPlaceholder onOpen={() => setVideoOpen(true)} />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <MetricCard icon={AlertTriangle} label="今日违停" value="23" unit="起" color="#FF4757" />
        <MetricCard icon={Clock} label="平均违停时长" value="18" unit="分钟" color="#F5A623" />
        <MetricCard icon={Camera} label="已处罚" value="15" unit="起" color="#00D0E9" />
      </div>
      <div style={{ padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 12, color: '#A0A8B4', marginBottom: 10 }}>今日违停时段分布</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 50 }}>
          {['06', '08', '10', '12', '14', '16', '18', '20'].map((h, i) => {
            const vals = [1, 3, 5, 2, 4, 6, 3, 1];
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 11, color: '#C9CDD4', fontFamily: 'DIN, monospace' }}>{vals[i]}</span>
                <div style={{ width: '100%', height: `${(vals[i] / 6) * 35}px`, background: vals[i] >= 5 ? '#FF4757' : '#F5A623', borderRadius: 3, minHeight: 3 }} />
                <span style={{ fontSize: 11, color: '#A0A8B4' }}>{h}:00</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 12, color: '#A0A8B4', marginBottom: 8 }}>最近违停记录</div>
        {[{ plate: '粤G·A2891', time: '14:23', dur: '12分钟', status: '已处罚' }, { plate: '琼B·C0412', time: '13:45', dur: '25分钟', status: '已处罚' }, { plate: '粤A·D9981', time: '12:10', dur: '8分钟', status: '待处理' }].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <span style={{ fontSize: 12, color: '#C9CDD4', fontFamily: 'monospace' }}>{r.plate}</span>
            <span style={{ fontSize: 11, color: '#A0A8B4' }}>{r.time}</span>
            <span style={{ fontSize: 11, color: '#F5A623' }}>{r.dur}</span>
            <span style={{ fontSize: 11, color: r.status === '已处罚' ? '#2ED573' : '#FF4757', padding: '1px 6px', background: r.status === '已处罚' ? 'rgba(46,213,115,0.1)' : 'rgba(255,71,87,0.1)', borderRadius: 3 }}>{r.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ============ 信号灯详情 ============
function SignalContent({ name: _name }: { name: string }) {
  const phases = [
    { dir: '南北直行', green: 35, yellow: 3, red: 42, active: true },
    { dir: '南北左转', green: 20, yellow: 3, red: 57, active: false },
    { dir: '东西直行', green: 30, yellow: 3, red: 47, active: false },
    { dir: '东西左转', green: 15, yellow: 3, red: 59, active: false },
  ];
  const cycle = 80;
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <MetricCard icon={Timer} label="周期时长" value={cycle} unit="秒" color="#00D0E9" />
        <MetricCard icon={TrendingUp} label="今日通行" value="3,240" unit="辆" color="#2ED573" />
        <MetricCard icon={Clock} label="运行时间" value="14h" color="#C9CDD4" />
      </div>
      <div style={{ padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#A0A8B4' }}>信号配时方案</span>
          <span style={{ fontSize: 11, color: '#00D0E9', padding: '2px 8px', background: 'rgba(0,208,233,0.1)', borderRadius: 4 }}>高峰方案</span>
        </div>
        {phases.map((p, i) => (
          <div key={i} style={{ marginBottom: i < phases.length - 1 ? 10 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: p.active ? '#FFFFFF' : '#C9CDD4', fontWeight: p.active ? 600 : 400 }}>
                {p.active && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#2ED573', marginRight: 6, animation: 'blink 1s infinite' }} />}
                {p.dir}
              </span>
              <span style={{ fontSize: 11, color: '#A0A8B4' }}>
                <span style={{ color: '#2ED573' }}>{p.green}s</span> / <span style={{ color: '#F5A623' }}>{p.yellow}s</span> / <span style={{ color: '#FF4757' }}>{p.red}s</span>
              </span>
            </div>
            {/* 配时条 */}
            <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${(p.green / cycle) * 100}%`, background: '#2ED573' }} />
              <div style={{ width: `${(p.yellow / cycle) * 100}%`, background: '#F5A623' }} />
              <div style={{ width: `${(p.red / cycle) * 100}%`, background: '#FF4757', opacity: 0.6 }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes blink { 0%,50% { opacity:1; } 51%,100% { opacity:0.3; } }`}</style>
    </>
  );
}

// ============ 发布屏详情 ============
function ScreenContent() {
  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid rgba(0,208,233,0.15)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,208,233,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Monitor size={14} color="#3B82F6" />
          <span style={{ fontSize: 12, color: '#C9CDD4' }}>当前发布内容</span>
        </div>
        <span style={{ fontSize: 11, color: '#A0A8B4' }}>更新: {new Date().toLocaleTimeString('zh-CN', { hour12: false })}</span>
      </div>
      <div style={{ padding: 20, background: 'linear-gradient(180deg, #0C1220 0%, #111827 100%)' }}>
        <div style={{ padding: 16, background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 8, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Type size={14} color="#F5A623" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#F5A623' }}>交通提示</span>
          </div>
          <div style={{ fontSize: 18, color: '#FFF', fontWeight: 700, lineHeight: 1.6 }}>前方进港大道车流量大</div>
          <div style={{ fontSize: 16, color: '#C9CDD4', lineHeight: 1.6, marginTop: 4 }}>建议绕行 S376 省道前往海安新港</div>
        </div>
        <div style={{ padding: 16, background: 'rgba(0,208,233,0.08)', border: '1px solid rgba(0,208,233,0.2)', borderRadius: 8, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ImageIcon size={14} color="#00D0E9" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#00D0E9' }}>限速提醒</span>
          </div>
          <div style={{ fontSize: 16, color: '#C9CDD4', lineHeight: 1.6 }}>前方施工路段限速 40km/h，请减速慢行</div>
        </div>
        <div style={{ padding: 12, background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, color: '#C9CDD4' }}>琼州海峡通航正常 | 风力 5 级 | 能见度良好</span>
          <span style={{ fontSize: 12, color: '#2ED573' }}>正常通航</span>
        </div>
      </div>
    </div>
  );
}

// ============ 无人机详情 ============
function DroneContent() {
  return (
    <>
      {/* 基本信息 */}
      <div style={{ padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(74,144,217,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Plane size={16} color="#4A90D9" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#FFF' }}>无人机-01</span>
          <span style={{ padding: '2px 8px', background: 'rgba(46,213,115,0.15)', borderRadius: 4, fontSize: 11, color: '#2ED573' }}>巡航中</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#A0A8B4' }}>DJI Matrice 350 RTK</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <MetricCard icon={Battery} label="电量" value="78" unit="%" color="#2ED573" />
          <MetricCard icon={MapPin} label="高度" value="120" unit="m" color="#00D0E9" />
          <MetricCard icon={Wind} label="风速" value="3.2" unit="m/s" color="#C9CDD4" />
          <MetricCard icon={Signal} label="信号" value="强" color="#2ED573" />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: '#A0A8B4' }}>
          <span>巡航: <span style={{ color: '#C9CDD4' }}>G207全线</span></span>
          <span>已飞: <span style={{ color: '#C9CDD4' }}>42分钟</span></span>
          <span>续航: <span style={{ color: '#2ED573' }}>68分钟</span></span>
        </div>
      </div>
      {/* 实时画面 */}
      <div style={{ height: 300, background: '#000', borderRadius: 10, border: '1px solid rgba(74,144,217,0.3)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #0C1622 0%, #162030 50%, #0E1A28 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(74,144,217,0.5)', animation: 'scanline 3s linear infinite', boxShadow: '0 0 15px rgba(74,144,217,0.6)' }} />
          {/* 俯瞰道路 */}
          <div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: 50, background: 'rgba(100,120,140,0.25)', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, borderTop: '2px dashed rgba(255,255,255,0.15)' }} />
          </div>
          {/* AI 框选车辆 */}
          {[
            { top: '28%', left: '12%', w: 55, h: 30, color: '#00D0E9', label: '小汽车 · 粤G·A2891', speed: '38 km/h →' },
            { top: '32%', left: '38%', w: 78, h: 34, color: '#F5A623', label: '大货车 · 琼A·T5567', speed: '25 km/h →' },
            { top: '40%', left: '62%', w: 70, h: 32, color: '#4A90D9', label: '冷链车 · 粤G·B7723', speed: '32 km/h →' },
            { top: '48%', left: '28%', w: 50, h: 28, color: '#2ED573', label: '小汽车 · 琼B·C0412', speed: '← 45 km/h' },
            { top: '46%', left: '76%', w: 74, h: 33, color: '#FF4757', label: '危化品 · 粤A·D9981', speed: '← 30 km/h' },
          ].map((v, i) => (
            <div key={i} style={{ position: 'absolute', top: v.top, left: v.left, width: v.w, height: v.h, border: `2px solid ${v.color}`, borderRadius: 3, boxShadow: v.color === '#FF4757' ? '0 0 8px rgba(255,71,87,0.3)' : 'none' }}>
              <div style={{ position: 'absolute', top: -16, left: 0, fontSize: 11, color: v.color, background: `${v.color}20`, padding: '1px 5px', borderRadius: 3, whiteSpace: 'nowrap' }}>{v.label}</div>
              <div style={{ position: 'absolute', bottom: -13, left: 0, fontSize: 11, color: '#A0A8B4' }}>{v.speed}</div>
            </div>
          ))}
          {/* HUD */}
          <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', borderRadius: 5, padding: '5px 10px', border: '1px solid rgba(74,144,217,0.2)' }}>
            <div style={{ fontSize: 11, color: '#4A90D9', fontFamily: 'monospace', fontWeight: 600 }}>无人机-01 | 实时画面</div>
            <div style={{ fontSize: 11, color: '#A0A8B4', fontFamily: 'monospace', marginTop: 1 }}>{new Date().toLocaleTimeString('zh-CN', { hour12: false })} | 120m | G207</div>
          </div>
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', borderRadius: 5, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#FF4757', fontFamily: 'monospace' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF4757', animation: 'blink 1s infinite' }} />REC
          </div>
          {/* 十字准星 */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 36, height: 36, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', width: 1, height: 10, background: 'rgba(74,144,217,0.4)', transform: 'translateX(-50%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '50%', width: 1, height: 10, background: 'rgba(74,144,217,0.4)', transform: 'translateX(-50%)' }} />
            <div style={{ position: 'absolute', left: 0, top: '50%', width: 10, height: 1, background: 'rgba(74,144,217,0.4)', transform: 'translateY(-50%)' }} />
            <div style={{ position: 'absolute', right: 0, top: '50%', width: 10, height: 1, background: 'rgba(74,144,217,0.4)', transform: 'translateY(-50%)' }} />
          </div>
          <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#A0A8B4' }}>
            <Thermometer size={9} color="#A0A8B4" />32°C
          </div>
          {/* 底部统计 */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.75)', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(74,144,217,0.15)', fontSize: 11 }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <span style={{ color: '#A0A8B4' }}>AI识别:</span>
              <span style={{ color: '#00D0E9' }}>小汽车 <b>23</b></span>
              <span style={{ color: '#F5A623' }}>货车 <b>8</b></span>
              <span style={{ color: '#4A90D9' }}>冷链 <b>3</b></span>
              <span style={{ color: '#FF4757' }}>危化品 <b>1</b></span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: '#A0A8B4' }}>均速 <span style={{ color: '#C9CDD4', fontWeight: 600 }}>35km/h</span></span>
              <span style={{ color: '#A0A8B4' }}>密度 <span style={{ color: '#F5A623', fontWeight: 600 }}>中</span></span>
            </div>
          </div>
        </div>
        <style>{`@keyframes scanline{0%{top:0}100%{top:100%}} @keyframes blink{0%,50%{opacity:1}51%,100%{opacity:.3}}`}</style>
      </div>
    </>
  );
}

// ============ 电子警察 / 超速抓拍 — 通用监控详情 ============
function GenericCameraContent({ name, videoOpen, setVideoOpen }: { name: string; videoOpen: boolean; setVideoOpen: (v: boolean) => void }) {
  return (
    <>
      {videoOpen ? <MockVideoFeed title={name} onClose={() => setVideoOpen(false)} /> : <VideoPlaceholder onOpen={() => setVideoOpen(true)} />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <MetricCard icon={TrendingUp} label="今日抓拍" value="1,286" unit="次" color="#00D0E9" />
        <MetricCard icon={Gauge} label="平均车速" value="42" unit="km/h" color="#C9CDD4" />
        <MetricCard icon={AlertTriangle} label="今日违法" value="37" unit="起" color="#FF4757" />
      </div>
    </>
  );
}

// ============ 主导出组件 ============
export default function CheckpointModal() {
  const { selectedDeviceType } = useDashboardStore();
  const [videoOpen, setVideoOpen] = useState(false);

  const typeConfig: Record<string, { title: string; name: string }> = {
    drone: { title: '无人机详情', name: '无人机-01' },
    screen: { title: '发布屏详情', name: '发布屏01' },
    signal: { title: '信号灯详情', name: '信号灯01' },
    checkpoint: { title: '卡口详情', name: '卡口A1' },
    parking: { title: '违停抓拍详情', name: '违停01' },
    police: { title: '电子警察详情', name: '警察01' },
    speed: { title: '超速抓拍详情', name: '测速01' },
  };
  const cfg = typeConfig[selectedDeviceType || 'checkpoint'] || typeConfig.checkpoint;

  return (
    <Modal id="checkpoint" title={cfg.title} width={selectedDeviceType === 'drone' ? 760 : 680}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 设备基本信息头 — 非无人机/发布屏显示 */}
        {selectedDeviceType !== 'drone' && selectedDeviceType !== 'screen' && (
          <div style={{ padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Camera size={16} color="#00D0E9" />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#FFF' }}>{cfg.name}</span>
              <span style={{ padding: '2px 8px', background: 'rgba(46,213,115,0.15)', borderRadius: 4, fontSize: 11, color: '#2ED573' }}>在线</span>
            </div>
            <div style={{ fontSize: 12, color: '#A0A8B4' }}>G207国道与X699县道交叉口</div>
          </div>
        )}

        {/* 按设备类型渲染不同内容 */}
        {selectedDeviceType === 'drone' && <DroneContent />}
        {selectedDeviceType === 'screen' && <ScreenContent />}
        {selectedDeviceType === 'signal' && <SignalContent name={cfg.name} />}
        {selectedDeviceType === 'checkpoint' && <CheckpointContent name={cfg.name} videoOpen={videoOpen} setVideoOpen={setVideoOpen} />}
        {selectedDeviceType === 'parking' && <ParkingContent name={cfg.name} videoOpen={videoOpen} setVideoOpen={setVideoOpen} />}
        {(selectedDeviceType === 'police' || selectedDeviceType === 'speed') && <GenericCameraContent name={cfg.name} videoOpen={videoOpen} setVideoOpen={setVideoOpen} />}
      </div>
    </Modal>
  );
}

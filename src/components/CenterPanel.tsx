import { useState } from 'react';
import { Map, TrendingUp, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useUIStore } from '../stores';
import HourlyChart from './HourlyChart';
import PressurePredictionChart from './overview/PressurePredictionChart';
import StraitTransitIndex from './overview/StraitTransitIndex';

interface CenterPanelProps {
  leftCollapsed?: boolean;
  rightCollapsed?: boolean;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
}

// Device types and their colors
const deviceTypes = [
  { id: 'all', label: '全部', color: '#00D0E9' },
  { id: 'police', label: '电子警察', color: '#DC2626' },
  { id: 'parking', label: '违停抓拍', color: '#F5A623' },
  { id: 'checkpoint', label: '治安卡口', color: '#00D0E9' },
  { id: 'speed', label: '超速抓拍', color: '#A855F7' },
  { id: 'signal', label: '信号灯', color: '#2ED573' },
  { id: 'screen', label: '发布屏', color: '#3B82F6' },
] as const;

type DeviceTypeId = typeof deviceTypes[number]['id'];

// Mock device markers — 县城路网(x=0~760,y=50~180), 港口左下(x=30~120,y=310~360)
// G207 y=100 | S376 y=170 | 城东路 x=300 | 港城大道 x=550 | 进港大道 x=200纵+斜向左下
const deviceMarkers = [
  { cx: 120, cy: 100, type: 'checkpoint', name: '卡口A1', online: true, labelDir: 'top' as const },
  { cx: 680, cy: 100, type: 'checkpoint', name: '卡口C3', online: true, labelDir: 'top' as const },
  { cx: 350, cy: 170, type: 'checkpoint', name: '卡口S376', online: true, labelDir: 'bottom' as const },
  { cx: 550, cy: 170, type: 'checkpoint', name: '港口卡口', online: true, labelDir: 'right' as const },
  { cx: 60, cy: 100, type: 'police', name: '警察01', online: true, labelDir: 'bottom' as const },
  { cx: 380, cy: 100, type: 'police', name: '警察02', online: true, labelDir: 'top' as const },
  { cx: 550, cy: 130, type: 'police', name: '警察03', online: false, labelDir: 'right' as const },
  { cx: 260, cy: 100, type: 'parking', name: '违停01', online: true, labelDir: 'bottom' as const },
  { cx: 460, cy: 170, type: 'parking', name: '违停02', online: true, labelDir: 'top' as const },
  { cx: 300, cy: 65, type: 'speed', name: '测速01', online: true, labelDir: 'right' as const },
  { cx: 710, cy: 100, type: 'speed', name: '测速02', online: true, labelDir: 'bottom' as const },
  { cx: 300, cy: 100, type: 'signal', name: '信号灯01', online: true, labelDir: 'top' as const },
  { cx: 550, cy: 100, type: 'signal', name: '信号灯02', online: true, labelDir: 'bottom' as const },
  { cx: 300, cy: 170, type: 'screen', name: '发布屏01', online: true, labelDir: 'bottom' as const },
] as const;

export default function CenterPanel({ leftCollapsed, rightCollapsed, onToggleLeft, onToggleRight }: CenterPanelProps) {
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const setSelectedDeviceType = useUIStore((s) => s.setSelectedDeviceType);
  const [activeFilter, setActiveFilter] = useState<DeviceTypeId>('all');
  const [dronesActive, setDronesActive] = useState(false);

  const handleMarkerClick = (_name: string, type: string) => {
    setSelectedDeviceType(type);
    setActiveModal('checkpoint');
  };

  const filteredMarkers = activeFilter === 'all'
    ? deviceMarkers
    : deviceMarkers.filter(m => m.type === activeFilter);

  const getDeviceColor = (type: string) => deviceTypes.find(d => d.id === type)?.color ?? '#A0A8B4';

  return (
    <div className="panel-center" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      {/* GIS地图 */}
      <div className="module-card full-height animate-in" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="module-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onToggleLeft && (
              <button
                onClick={onToggleLeft}
                title={leftCollapsed ? '展开左侧面板' : '收起左侧面板'}
                aria-label={leftCollapsed ? '展开左侧面板' : '收起左侧面板'}
                style={{
                  background: 'rgba(0, 208, 233, 0.1)',
                  border: '1px solid rgba(0, 208, 233, 0.2)',
                  borderRadius: 4,
                  padding: '4px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {leftCollapsed ? <PanelLeftOpen size={14} color="#00D0E9" /> : <PanelLeftClose size={14} color="#00D0E9" />}
              </button>
            )}
            <span className="module-title">GIS地图</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {deviceTypes.map((dt) => (
                <button
                  key={dt.id}
                  onClick={() => setActiveFilter(dt.id)}
                  aria-label={`筛选${dt.label}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    background: activeFilter === dt.id ? `${dt.color}20` : 'transparent',
                    border: `1px solid ${activeFilter === dt.id ? `${dt.color}60` : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    color: activeFilter === dt.id ? dt.color : '#A0A8B4',
                    whiteSpace: 'nowrap',
                    transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (activeFilter !== dt.id) {
                      e.currentTarget.style.background = `${dt.color}10`;
                      e.currentTarget.style.borderColor = `${dt.color}40`;
                      e.currentTarget.style.color = dt.color;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFilter !== dt.id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = '#A0A8B4';
                    }
                  }}
                >
                  {dt.id !== 'all' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dt.color, display: 'inline-block' }} />}
                  {dt.label}
                </button>
              ))}
            </div>
            {/* 无人机启动按钮 */}
            <button
              onClick={() => setDronesActive(!dronesActive)}
              aria-label={dronesActive ? '关闭无人机' : '启动无人机'}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 10px',
                background: dronesActive ? 'rgba(46,213,115,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${dronesActive ? 'rgba(46,213,115,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 4, cursor: 'pointer', fontSize: 11,
                color: dronesActive ? '#2ED573' : '#A0A8B4',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: dronesActive ? '#2ED573' : '#4B5563', transition: 'background 0.2s' }} />
              {dronesActive ? '无人机巡航中' : '启动无人机'}
            </button>
            <div className="module-icon">
              <Map size={16} />
            </div>
            {onToggleRight && (
              <button
                onClick={onToggleRight}
                title={rightCollapsed ? '展开右侧面板' : '收起右侧面板'}
                aria-label={rightCollapsed ? '展开右侧面板' : '收起右侧面板'}
                style={{
                  background: 'rgba(0, 208, 233, 0.1)',
                  border: '1px solid rgba(0, 208, 233, 0.2)',
                  borderRadius: 4,
                  padding: '4px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {rightCollapsed ? <PanelRightOpen size={14} color="#00D0E9" /> : <PanelRightClose size={14} color="#00D0E9" />}
              </button>
            )}
          </div>
        </div>

        <div style={{
          flex: 1,
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 10,
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0,
          border: '1px solid rgba(0, 208, 233, 0.1)'
        }}>
          {/* 地图网格背景 */}
          <svg
            style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.3 }}
            viewBox="0 0 760 400"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="mapGrid2" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 208, 233, 0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapGrid2)"/>

            {/* 道路网格线 */}
            <g stroke="rgba(0, 208, 233, 0.15)" strokeWidth="1" strokeDasharray="10,5">
              <line x1="0" y1="100" x2="760" y2="100"/>
              <line x1="0" y1="200" x2="760" y2="200"/>
              <line x1="0" y1="300" x2="760" y2="300"/>
              <line x1="190" y1="0" x2="190" y2="400"/>
              <line x1="380" y1="0" x2="380" y2="400"/>
              <line x1="570" y1="0" x2="570" y2="400"/>
            </g>
          </svg>

          {/* 道路 */}
          <svg
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            viewBox="0 0 760 400"
            preserveAspectRatio="xMidYMid slice"
          >
            <g fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              {/* === 县城路网 === */}
              {/* G207国道 - 横向 y=100 */}
              <path d="M30 100 L200 100" stroke="#00D0E9"/>
              <path d="M200 100 L450 100" stroke="#F5A623"/>
              <path d="M450 100 L730 100" stroke="#2ED573"/>

              {/* S376省道 - 横向 y=170 */}
              <path d="M30 170 L200 170" stroke="#00D0E9"/>
              <path d="M200 170 L450 170" stroke="#F5A623"/>
              <path d="M450 170 L730 170" stroke="#00D0E9"/>

              {/* 城东路 - 纵向 x=300 */}
              <path d="M300 50 L300 100" stroke="#00D0E9"/>
              <path d="M300 100 L300 170" stroke="#F5A623"/>

              {/* 港城大道 - 纵向 x=550 */}
              <path d="M550 50 L550 100" stroke="#00D0E9"/>
              <path d="M550 100 L550 170" stroke="#F5A623"/>

              {/* === 进港大道（从县城斜向左下到港口入口）=== */}
              <path d="M200 170 L180 200 L170 230 L170 255" stroke="#F5A623" strokeWidth="6"/>

              {/* 进港大道连接到 G207 */}
              <path d="M200 100 L200 170" stroke="#F5A623"/>
            </g>

            {/* === 徐闻港（左下角，右移避开左侧面板） === */}
            <g>
              <rect x="165" y="255" width="120" height="42" rx="5" fill="rgba(0,208,233,0.06)" stroke="rgba(0,208,233,0.15)" strokeWidth="1"/>
              <text x="225" y="267" textAnchor="middle" fill="#00D0E9" fontSize="8" fontWeight="600" fontFamily="sans-serif">徐闻港</text>
              <rect x="171" y="272" width="28" height="12" rx="2" fill="rgba(245,166,35,0.1)" stroke="rgba(245,166,35,0.2)" strokeWidth="0.6"/>
              <text x="185" y="281" textAnchor="middle" fill="#F5A623" fontSize="5.5" fontFamily="sans-serif">停车场</text>
              <rect x="203" y="272" width="22" height="12" rx="2" fill="rgba(255,107,53,0.1)" stroke="rgba(255,107,53,0.2)" strokeWidth="0.6"/>
              <text x="214" y="281" textAnchor="middle" fill="#FF6B35" fontSize="5.5" fontFamily="sans-serif">排队</text>
              <rect x="229" y="272" width="48" height="12" rx="2" fill="rgba(0,208,233,0.1)" stroke="rgba(0,208,233,0.25)" strokeWidth="0.6"/>
              <text x="253" y="281" textAnchor="middle" fill="#00D0E9" fontSize="5.5" fontFamily="sans-serif">泊位 3/4</text>
              {[0,1,2,3,4].map(i => (
                <rect key={`q${i}`} x={205 + i * 5} y={286} width={3.5} height={5} rx={0.6} fill="#8B95A5" opacity={0.6}/>
              ))}
              <text x="225" y="296" textAnchor="middle" fill="#A0A8B4" fontSize="5.5" fontFamily="sans-serif">等待 1,200 辆</text>
            </g>

            {/* === 琼州海峡（港口下方） === */}
            <g>
              <rect x="140" y="300" width="180" height="100" fill="rgba(0,100,180,0.05)"/>
              <text x="230" y="345" textAnchor="middle" fill="rgba(0,208,233,0.18)" fontSize="8" fontFamily="sans-serif" letterSpacing="2">~ 琼州海峡 ~</text>
              <text x="230" y="360" textAnchor="middle" fill="rgba(0,208,233,0.12)" fontSize="6" fontFamily="sans-serif">↓ 海口方向</text>
            </g>

            {/* === 船舶航线 === */}
            <g>
              <path d="M220 295 L220 400" fill="none" stroke="rgba(0,208,233,0.1)" strokeWidth="1.5" strokeDasharray="5 4"/>

              {/* 满载船A — 南下去海口（0~16s可见） */}
              <g><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.44;0.45;1" dur="36s" repeatCount="indefinite"/>
                <animateMotion dur="16s" begin="0s" repeatCount="indefinite" path="M220,295 L220,400"/>
                <path d="M-9,-13 L9,-13 L11,-5 L11,7 L0,14 L-11,7 L-11,-5 Z" fill="#D0D8E0" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
                <rect x="-7" y="-11" width="14" height="16" rx="2" fill="#B8C4D0" opacity="0.5"/>
                <rect x="-3.5" y="-12" width="7" height="4" rx="1.5" fill="#8899AA"/>
                <rect x="2.5" y="-15" width="2.5" height="3.5" rx="0.8" fill="#6B7A8A"/>
                <rect x="-5.5" y="-5" width="3.5" height="2.5" rx="0.6" fill="#8B95A5"/>
                <rect x="2" y="-5" width="3.5" height="2.5" rx="0.6" fill="#8B95A5"/>
                <rect x="-5.5" y="-1.5" width="3.5" height="2.5" rx="0.6" fill="#7A8494"/>
                <rect x="2" y="-1.5" width="3.5" height="2.5" rx="0.6" fill="#A0AAB8"/>
                <rect x="-5.5" y="2" width="3.5" height="2.5" rx="0.6" fill="#8B8060"/>
                <rect x="2" y="2" width="3.5" height="2.5" rx="0.6" fill="#8B95A5"/>
                <circle cx="0" cy="12" r="1.5" fill="#2ED573"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle>
              </g>

              {/* 空载船A — 北上回徐闻（18~34s可见） */}
              <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.5;0.51;0.94;0.95;1" dur="36s" repeatCount="indefinite"/>
                <animateMotion dur="16s" begin="18s" repeatCount="indefinite" path="M220,400 L220,295"/>
                <path d="M-9,13 L9,13 L11,5 L11,-7 L0,-14 L-11,-7 L-11,5 Z" fill="#B8C4D0" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
                <rect x="-7" y="-5" width="14" height="16" rx="2" fill="#A0ACB8" opacity="0.4"/>
                <rect x="-3.5" y="8" width="7" height="4" rx="1.5" fill="#8899AA"/>
                <rect x="2.5" y="11" width="2.5" height="3.5" rx="0.8" fill="#6B7A8A"/>
                <circle cx="0" cy="-12" r="1.5" fill="#FF4757"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle>
              </g>

              {/* 满载船B — 错开18s南下（18~34s可见） */}
              <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.5;0.51;0.94;0.95;1" dur="36s" repeatCount="indefinite"/>
                <animateMotion dur="16s" begin="18s" repeatCount="indefinite" path="M200,295 L200,400"/>
                <path d="M-9,-13 L9,-13 L11,-5 L11,7 L0,14 L-11,7 L-11,-5 Z" fill="#C8D4E0" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
                <rect x="-7" y="-11" width="14" height="16" rx="2" fill="#B0BCC8" opacity="0.45"/>
                <rect x="-3.5" y="-12" width="7" height="4" rx="1.5" fill="#8899AA"/>
                <rect x="2.5" y="-15" width="2.5" height="3.5" rx="0.8" fill="#6B7A8A"/>
                <rect x="-5.5" y="-5" width="3.5" height="2.5" rx="0.6" fill="#8B95A5"/>
                <rect x="2" y="-5" width="3.5" height="2.5" rx="0.6" fill="#7A8494"/>
                <rect x="-5.5" y="-1.5" width="3.5" height="2.5" rx="0.6" fill="#A0AAB8"/>
                <rect x="2" y="-1.5" width="3.5" height="2.5" rx="0.6" fill="#8B95A5"/>
                <circle cx="0" cy="12" r="1.5" fill="#2ED573"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle>
              </g>

              {/* 空载船B — 错开18s北上（0~16s可见） */}
              <g><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.44;0.45;1" dur="36s" repeatCount="indefinite"/>
                <animateMotion dur="16s" begin="0s" repeatCount="indefinite" path="M200,400 L200,295"/>
                <path d="M-9,13 L9,13 L11,5 L11,-7 L0,-14 L-11,-7 L-11,5 Z" fill="#B0BCC8" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
                <rect x="-7" y="-5" width="14" height="16" rx="2" fill="#98A4B0" opacity="0.4"/>
                <rect x="-3.5" y="8" width="7" height="4" rx="1.5" fill="#8899AA"/>
                <rect x="2.5" y="11" width="2.5" height="3.5" rx="0.8" fill="#6B7A8A"/>
                <circle cx="0" cy="-12" r="1.5" fill="#FF4757"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle>
              </g>

              {/* 船舶3 — 泊位装载中（静止） */}
              <g transform="translate(255, 290)">
                <path d="M-9,-12 L9,-12 L11,-5 L11,7 L0,13 L-11,7 L-11,-5 Z" fill="#D8E0E8" stroke="rgba(0,208,233,0.3)" strokeWidth="0.8"/>
                <rect x="-7" y="-10" width="14" height="16" rx="2" fill="#C0CCD8" opacity="0.4"/>
                <rect x="-3.5" y="-11" width="7" height="4" rx="1.2" fill="#8899AA"/>
                <rect x="-5" y="-5" width="3.5" height="2.5" rx="0.6" fill="#8B95A5"/>
                <rect x="1.5" y="-5" width="3.5" height="2.5" rx="0.6" fill="#8B95A5"/>
                <rect x="-5" y="-1.5" width="3.5" height="2.5" rx="0.6" fill="#7A8494"/>
                <rect x="1.5" y="-1.5" width="3.5" height="2.5" rx="0.6" fill="#F5A623" opacity="0.6"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite"/></rect>
                <text y="20" textAnchor="middle" fill="#00D0E9" fontSize="5" fontFamily="sans-serif">装载中</text>
              </g>
            </g>
            {/* 设备点位（按筛选类型显示） */}
            {filteredMarkers.map((m, i) => {
              const color = m.online ? getDeviceColor(m.type) : '#4B5563';
              // 根据 labelDir 计算标签偏移，避免与道路名称重叠
              const labelMap = {
                top:    { dx: 0, dy: -14, anchor: 'middle' as const },
                bottom: { dx: 0, dy: 22, anchor: 'middle' as const },
                left:   { dx: -14, dy: 4, anchor: 'end' as const },
                right:  { dx: 14, dy: 4, anchor: 'start' as const },
              };
              const labelOffset = labelMap[m.labelDir] ?? { dx: 0, dy: 18, anchor: 'middle' as const };
              return (
                <g key={i} role="button" aria-label={m.name} style={{ cursor: 'pointer' }} onClick={() => handleMarkerClick(m.name, m.type)}
                  onMouseEnter={(e) => {
                    const halo = e.currentTarget.querySelector('.device-halo') as SVGCircleElement;
                    if (halo) halo.setAttribute('opacity', '1');
                  }}
                  onMouseLeave={(e) => {
                    const halo = e.currentTarget.querySelector('.device-halo') as SVGCircleElement;
                    if (halo) halo.setAttribute('opacity', '0');
                  }}
                >
                  <circle className="device-halo" cx={m.cx} cy={m.cy} r={14} fill={`${color}`} opacity={0} style={{ transition: 'opacity 0.2s ease' }}>
                    <animate attributeName="opacity" values="0.15;0.25;0.15" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={m.cx} cy={m.cy} r={8} fill="#121A26" stroke={color} strokeWidth="2" strokeOpacity={m.online ? 1 : 0.4} />
                  <circle cx={m.cx} cy={m.cy} r={3} fill={color} opacity={m.online ? 1 : 0.4} />
                  <text x={m.cx + labelOffset.dx} y={m.cy + labelOffset.dy} textAnchor={labelOffset.anchor} fill={m.online ? '#C9CDD4' : '#4B5563'} fontSize="8" fontFamily="sans-serif">{m.name}</text>
                  {!m.online && <line x1={m.cx - 5} y1={m.cy - 5} x2={m.cx + 5} y2={m.cy + 5} stroke="#FF4757" strokeWidth="1.5" />}
                </g>
              );
            })}

            {/* 道路标注 */}
            <g fill="#A0A8B4" fontSize="10" fontFamily="sans-serif" opacity="0.8">
              <text x="40" y="93" textAnchor="start" fontSize="9">G207</text>
              <text x="720" y="93" textAnchor="end" fontSize="9">G207</text>
              <text x="40" y="163" textAnchor="start" fontSize="9">S376</text>
              <text x="720" y="163" textAnchor="end" fontSize="9">S376</text>
              <text x="290" y="55" textAnchor="end" fontSize="9">城东路</text>
              <text x="560" y="55" textAnchor="start" fontSize="9">港城大道</text>
              <text x="100" y="255" textAnchor="start" fontSize="9">进港大道</text>
            </g>

            {/* 徐闻县城标记（港城大道上方） */}
            <g transform="translate(550, 35)">
              <circle r="14" fill="rgba(0, 208, 233, 0.1)">
                <animate attributeName="r" values="10;18;10" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle r="7" fill="rgba(0, 208, 233, 0.2)"/>
              <circle r="3.5" fill="#00D0E9"/>
              <text x="18" y="4" textAnchor="start" fill="#00D0E9" fontSize="9" fontFamily="sans-serif" fontWeight="500">徐闻县城</text>
            </g>

            {/* 车辆模板 — 统一低饱和灰色调，通过轮廓和标识区分车型 */}
            <defs>
              {/* 小汽车 右/左/下/上 (12x6) */}
              <g id="sedan-r"><rect x="-6" y="-3" width="12" height="6" rx="2" fill="#8B95A5"/><rect x="2" y="-2" width="4" height="4" rx="1" fill="#6B7585" opacity="0.7"/><rect x="-5" y="-3.8" width="2" height="1.2" rx="0.4" fill="#5A6373"/><rect x="-5" y="2.6" width="2" height="1.2" rx="0.4" fill="#5A6373"/><rect x="3" y="-3.8" width="2" height="1.2" rx="0.4" fill="#5A6373"/><rect x="3" y="2.6" width="2" height="1.2" rx="0.4" fill="#5A6373"/></g>
              <g id="sedan-l"><rect x="-6" y="-3" width="12" height="6" rx="2" fill="#8B95A5"/><rect x="-6" y="-2" width="4" height="4" rx="1" fill="#6B7585" opacity="0.7"/><rect x="-5" y="-3.8" width="2" height="1.2" rx="0.4" fill="#5A6373"/><rect x="-5" y="2.6" width="2" height="1.2" rx="0.4" fill="#5A6373"/><rect x="3" y="-3.8" width="2" height="1.2" rx="0.4" fill="#5A6373"/><rect x="3" y="2.6" width="2" height="1.2" rx="0.4" fill="#5A6373"/></g>
              <g id="sedan-d"><rect x="-3" y="-6" width="6" height="12" rx="2" fill="#8B95A5"/><rect x="-2" y="2" width="4" height="4" rx="1" fill="#6B7585" opacity="0.7"/><rect x="-3.8" y="-5" width="1.2" height="2" rx="0.4" fill="#5A6373"/><rect x="2.6" y="-5" width="1.2" height="2" rx="0.4" fill="#5A6373"/><rect x="-3.8" y="3" width="1.2" height="2" rx="0.4" fill="#5A6373"/><rect x="2.6" y="3" width="1.2" height="2" rx="0.4" fill="#5A6373"/></g>
              <g id="sedan-u"><rect x="-3" y="-6" width="6" height="12" rx="2" fill="#8B95A5"/><rect x="-2" y="-6" width="4" height="4" rx="1" fill="#6B7585" opacity="0.7"/><rect x="-3.8" y="-5" width="1.2" height="2" rx="0.4" fill="#5A6373"/><rect x="2.6" y="-5" width="1.2" height="2" rx="0.4" fill="#5A6373"/><rect x="-3.8" y="3" width="1.2" height="2" rx="0.4" fill="#5A6373"/><rect x="2.6" y="3" width="1.2" height="2" rx="0.4" fill="#5A6373"/></g>

              {/* 大货车 右/左/下 (18x7) 车头+货厢，中间分隔线 */}
              <g id="truck-r"><rect x="-9" y="-3.5" width="18" height="7" rx="1.5" fill="#7A8494"/><rect x="4" y="-3" width="5" height="6" rx="1" fill="#6B7585"/><line x1="-2" y1="-3.5" x2="-2" y2="3.5" stroke="#5A6373" strokeWidth="0.8"/><rect x="-8" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="-8" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="2" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="2" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="6" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="6" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/></g>
              <g id="truck-l"><rect x="-9" y="-3.5" width="18" height="7" rx="1.5" fill="#7A8494"/><rect x="-9" y="-3" width="5" height="6" rx="1" fill="#6B7585"/><line x1="2" y1="-3.5" x2="2" y2="3.5" stroke="#5A6373" strokeWidth="0.8"/><rect x="-8" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="-8" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="2" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="2" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="5.5" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="5.5" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/></g>
              <g id="truck-d"><rect x="-3.5" y="-9" width="7" height="18" rx="1.5" fill="#7A8494"/><rect x="-3" y="4" width="6" height="5" rx="1" fill="#6B7585"/><line x1="-3.5" y1="-2" x2="3.5" y2="-2" stroke="#5A6373" strokeWidth="0.8"/><rect x="-4.5" y="-8" width="1.5" height="2.5" rx="0.5" fill="#5A6373"/><rect x="3" y="-8" width="1.5" height="2.5" rx="0.5" fill="#5A6373"/><rect x="-4.5" y="2" width="1.5" height="2.5" rx="0.5" fill="#5A6373"/><rect x="3" y="2" width="1.5" height="2.5" rx="0.5" fill="#5A6373"/><rect x="-4.5" y="6" width="1.5" height="2.5" rx="0.5" fill="#5A6373"/><rect x="3" y="6" width="1.5" height="2.5" rx="0.5" fill="#5A6373"/></g>

              {/* 冷链车 右/左 (18x7) 白色货厢+蓝色雪花标 */}
              <g id="cold-r"><rect x="-9" y="-3.5" width="18" height="7" rx="1.5" fill="#A0AAB8"/><rect x="-8" y="-3" width="11" height="6" rx="1" fill="#B8C4D0"/><rect x="4" y="-3" width="5" height="6" rx="1" fill="#6B7585"/><text x="-2.5" y="1.5" fontSize="5" fill="#4A90D9" fontWeight="bold" textAnchor="middle">*</text><rect x="-8" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="-8" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="2" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="2" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="6" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="6" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/></g>
              <g id="cold-l"><rect x="-9" y="-3.5" width="18" height="7" rx="1.5" fill="#A0AAB8"/><rect x="-3" y="-3" width="11" height="6" rx="1" fill="#B8C4D0"/><rect x="-9" y="-3" width="5" height="6" rx="1" fill="#6B7585"/><text x="2.5" y="1.5" fontSize="5" fill="#4A90D9" fontWeight="bold" textAnchor="middle">*</text><rect x="-8" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="-8" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="2" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="2" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="5.5" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="5.5" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/></g>

              {/* 危化品车 右/下 (18x7) 暗黄罐体+菱形危标 */}
              <g id="hazmat-r"><rect x="-9" y="-3.5" width="18" height="7" rx="1.5" fill="#8B8060"/><ellipse cx="-2" cy="0" rx="6" ry="3" fill="#9E9470" opacity="0.8"/><rect x="4" y="-3" width="5" height="6" rx="1" fill="#6B7585"/><polygon points="-2,-2.5 0,0 -2,2.5 -4,0" fill="none" stroke="#C4A24A" strokeWidth="0.7"/><rect x="-8" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="-8" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="2" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="2" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="6" y="-4.5" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/><rect x="6" y="3" width="2.5" height="1.5" rx="0.5" fill="#5A6373"/></g>
              <g id="hazmat-d"><rect x="-3.5" y="-9" width="7" height="18" rx="1.5" fill="#8B8060"/><ellipse cx="0" cy="-2" rx="3" ry="6" fill="#9E9470" opacity="0.8"/><rect x="-3" y="4" width="6" height="5" rx="1" fill="#6B7585"/><polygon points="0,-4 2.5,-2 0,0 -2.5,-2" fill="none" stroke="#C4A24A" strokeWidth="0.7"/><rect x="-4.5" y="-8" width="1.5" height="2.5" rx="0.5" fill="#5A6373"/><rect x="3" y="-8" width="1.5" height="2.5" rx="0.5" fill="#5A6373"/><rect x="-4.5" y="2" width="1.5" height="2.5" rx="0.5" fill="#5A6373"/><rect x="3" y="2" width="1.5" height="2.5" rx="0.5" fill="#5A6373"/><rect x="-4.5" y="6" width="1.5" height="2.5" rx="0.5" fill="#5A6373"/><rect x="3" y="6" width="1.5" height="2.5" rx="0.5" fill="#5A6373"/></g>
            </defs>

            {/* === 车辆动画 === */}
            {/* === 车辆动画 === */}
            {/* G207 东向 y=97 */}
            <use href="#sedan-r"><animate attributeName="x" values="10;350" dur="9s" repeatCount="indefinite"/><animate attributeName="y" values="97;97" dur="9s" repeatCount="indefinite"/></use>
            <use href="#truck-r"><animate attributeName="x" values="300;650" dur="10s" repeatCount="indefinite"/><animate attributeName="y" values="96;96" dur="10s" repeatCount="indefinite"/></use>
            <use href="#cold-r"><animate attributeName="x" values="500;750" dur="7s" repeatCount="indefinite"/><animate attributeName="y" values="96;96" dur="7s" repeatCount="indefinite"/></use>
            {/* G207 西向 y=103 */}
            <use href="#sedan-l"><animate attributeName="x" values="730;250" dur="10s" repeatCount="indefinite"/><animate attributeName="y" values="103;103" dur="10s" repeatCount="indefinite"/></use>
            <use href="#sedan-l"><animate attributeName="x" values="400;30" dur="8s" repeatCount="indefinite"/><animate attributeName="y" values="103;103" dur="8s" repeatCount="indefinite"/></use>
            {/* S376 东向 y=167 */}
            <use href="#sedan-r"><animate attributeName="x" values="10;400" dur="9s" repeatCount="indefinite"/><animate attributeName="y" values="167;167" dur="9s" repeatCount="indefinite"/></use>
            <use href="#truck-r"><animate attributeName="x" values="380;740" dur="10s" repeatCount="indefinite"/><animate attributeName="y" values="167;167" dur="10s" repeatCount="indefinite"/></use>
            {/* S376 西向 y=173 */}
            <use href="#cold-l"><animate attributeName="x" values="700;200" dur="11s" repeatCount="indefinite"/><animate attributeName="y" values="173;173" dur="11s" repeatCount="indefinite"/></use>
            {/* 城东路 x=297 */}
            <use href="#sedan-d"><animate attributeName="x" values="297;297" dur="6s" repeatCount="indefinite"/><animate attributeName="y" values="55;160" dur="6s" repeatCount="indefinite"/></use>
            {/* 港城大道 x=547 */}
            <use href="#sedan-d"><animate attributeName="x" values="547;547" dur="6s" repeatCount="indefinite"/><animate attributeName="y" values="55;160" dur="6s" repeatCount="indefinite"/></use>
            {/* 进港大道纵段 x=197 */}
            <use href="#sedan-d"><animate attributeName="x" values="197;197" dur="5s" repeatCount="indefinite"/><animate attributeName="y" values="105;165" dur="5s" repeatCount="indefinite"/></use>
            {/* 进港大道斜段 — animateMotion + rotate="auto" */}
            <g><animateMotion dur="10s" repeatCount="indefinite" rotate="auto" path="M200,170 L180,200 L170,230 L170,255"/><use href="#sedan-r"/></g>
            <g><animateMotion dur="12s" begin="3s" repeatCount="indefinite" rotate="auto" path="M200,170 L180,200 L170,230 L170,255"/><use href="#truck-r"/></g>
            <g><animateMotion dur="14s" begin="7s" repeatCount="indefinite" rotate="auto" path="M200,170 L180,200 L170,230 L170,255"/><use href="#cold-r"/></g>
            {/* 进港大道返程 */}
            <g><animateMotion dur="11s" begin="5s" repeatCount="indefinite" rotate="auto" path="M170,255 L170,230 L180,200 L200,170"/><use href="#sedan-r"/></g>

            {/* 路口红绿灯 */}
            <g>
              {/* 信号灯01 (300,100) - G207与城东路交叉口 */}
              <g transform="translate(300, 85)">
                <rect x="-3" y="-8" width="6" height="16" rx="1" fill="#1A2332" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                <circle cx="0" cy="-4" r="2.5" fill="#FF4757"><animate attributeName="opacity" values="1;1;0;0;1;1" dur="6s" repeatCount="indefinite"/></circle>
                <circle cx="0" cy="4" r="2.5" fill="#2ED573"><animate attributeName="opacity" values="0;0;1;1;0;0" dur="6s" repeatCount="indefinite"/></circle>
              </g>
              {/* 信号灯02 (550,100) - G207与港城大道交叉口 */}
              <g transform="translate(550, 85)">
                <rect x="-3" y="-8" width="6" height="16" rx="1" fill="#1A2332" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                <circle cx="0" cy="-4" r="2.5" fill="#FF4757"><animate attributeName="opacity" values="1;1;0;0;1;1" dur="6s" begin="3s" repeatCount="indefinite"/></circle>
                <circle cx="0" cy="4" r="2.5" fill="#2ED573"><animate attributeName="opacity" values="0;0;1;1;0;0" dur="6s" begin="3s" repeatCount="indefinite"/></circle>
              </g>
              {/* 信号灯03 (200,170) - S376与进港大道交叉口 */}
              <g transform="translate(200, 155)">
                <rect x="-3" y="-8" width="6" height="16" rx="1" fill="#1A2332" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                <circle cx="0" cy="-4" r="2.5" fill="#FF4757"><animate attributeName="opacity" values="1;1;0;0;1;1" dur="6s" begin="1.5s" repeatCount="indefinite"/></circle>
                <circle cx="0" cy="4" r="2.5" fill="#2ED573"><animate attributeName="opacity" values="0;0;1;1;0;0" dur="6s" begin="1.5s" repeatCount="indefinite"/></circle>
              </g>
            </g>
          </svg>

          {/* 无人机 — 仅在启动后显示 */}
          {dronesActive && (
          <>
          {/* 无人机 1 - 沿 G207 巡航 */}
          <div
            role="button"
            aria-label="无人机-01"
            tabIndex={0}
            onClick={() => handleMarkerClick('无人机-01', 'drone')}
            style={{
              position: 'absolute', width: 80, height: 80,
              top: '10%', cursor: 'pointer', zIndex: 10,
              animation: 'droneFloat1 20s linear infinite',
            }}
          >
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.2)', animation: 'dronePulse 3s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', top: '65%', left: '50%', width: 1, height: 35, background: 'linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)', transform: 'translateX(-50%)' }} />
            <svg viewBox="-28 -22 56 44" width="64" height="52" style={{ position: 'absolute', top: 8, left: 8 }}>
              <line x1="-20" y1="-14" x2="20" y2="14" stroke="#FFF" strokeWidth="3"/>
              <line x1="20" y1="-14" x2="-20" y2="14" stroke="#FFF" strokeWidth="3"/>
              <ellipse cx="0" cy="0" rx="12" ry="9" fill="#FFF"/>
              <ellipse cx="0" cy="-1" rx="7" ry="4" fill="#C8D0D8" opacity="0.5"/>
              <circle cx="-20" cy="-14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
              <circle cx="20" cy="-14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
              <circle cx="-20" cy="14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
              <circle cx="20" cy="14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
              <circle cx="0" cy="0" r="3" fill="#00FF88"><animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite"/></circle>
            </svg>
            <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 4, padding: '2px 8px', whiteSpace: 'nowrap', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#FFF', fontWeight: 700 }}>无人机-01</div>
              <div style={{ fontSize: 11, color: '#A0AAB8' }}>G207巡航</div>
            </div>
          </div>

          {/* 无人机 2 - 沿进港大道巡航（从县城到港口方向） */}
          <div
            role="button"
            aria-label="无人机-02"
            tabIndex={0}
            onClick={() => handleMarkerClick('无人机-02', 'drone')}
            style={{
              position: 'absolute', width: 80, height: 80,
              cursor: 'pointer', zIndex: 10,
              animation: 'droneFloat2 18s linear infinite',
            }}
          >
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.2)', animation: 'dronePulse 3s ease-in-out infinite 1s' }} />
            <div style={{ position: 'absolute', top: '65%', left: '50%', width: 1, height: 35, background: 'linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)', transform: 'translateX(-50%)' }} />
            <svg viewBox="-28 -22 56 44" width="64" height="52" style={{ position: 'absolute', top: 8, left: 8 }}>
              <line x1="-20" y1="-14" x2="20" y2="14" stroke="#FFF" strokeWidth="3"/>
              <line x1="20" y1="-14" x2="-20" y2="14" stroke="#FFF" strokeWidth="3"/>
              <ellipse cx="0" cy="0" rx="12" ry="9" fill="#FFF"/>
              <ellipse cx="0" cy="-1" rx="7" ry="4" fill="#C8D0D8" opacity="0.5"/>
              <circle cx="-20" cy="-14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
              <circle cx="20" cy="-14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
              <circle cx="-20" cy="14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
              <circle cx="20" cy="14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
              <circle cx="0" cy="0" r="3" fill="#00FF88"><animate attributeName="opacity" values="1;0.2;1" dur="1.2s" begin="0.5s" repeatCount="indefinite"/></circle>
            </svg>
            <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 4, padding: '2px 8px', whiteSpace: 'nowrap', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#FFF', fontWeight: 700 }}>无人机-02</div>
              <div style={{ fontSize: 11, color: '#A0AAB8' }}>港城大道</div>
            </div>
          </div>

          <style>{`
            @keyframes droneFloat1 {
              0% { left: 0%; }
              50% { left: 85%; }
              100% { left: 0%; }
            }
            @keyframes droneFloat2 {
              0% { left: 24%; top: 25%; }
              25% { left: 22%; top: 33%; }
              50% { left: 20%; top: 42%; }
              75% { left: 22%; top: 33%; }
              100% { left: 24%; top: 25%; }
            }
            @keyframes dronePulse {
              0%, 100% { transform: translate(-50%,-50%) scale(0.85); opacity: 0.3; }
              50% { transform: translate(-50%,-50%) scale(1.3); opacity: 0.05; }
            }
          `}</style>
          </>
          )}

          {/* 图例 — 左上角 */}
          <div style={{
            position: 'absolute',
            top: 12,
            left: 12,
            display: 'flex',
            gap: 12,
            padding: '6px 12px',
            background: 'rgba(18, 26, 38, 0.95)',
            borderRadius: 6,
            border: '1px solid rgba(0, 208, 233, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 4, background: '#2ED573', borderRadius: 2 }} />
              <span style={{ fontSize: 12, color: '#A0A8B4' }}>畅通</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 4, background: '#00D0E9', borderRadius: 2 }} />
              <span style={{ fontSize: 12, color: '#A0A8B4' }}>正常</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 4, background: '#F5A623', borderRadius: 2 }} />
              <span style={{ fontSize: 12, color: '#A0A8B4' }}>拥堵</span>
            </div>
          </div>

          {/* 统计数据 */}
          <div style={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            gap: 12
          }}>
            <div style={{
              padding: '8px 14px',
              background: 'rgba(18, 26, 38, 0.95)',
              borderRadius: 6,
              border: '1px solid rgba(0, 208, 233, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 11, color: '#A0A8B4' }}>拥堵路段</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#F5A623' }}>2</div>
            </div>
            <div style={{
              padding: '8px 14px',
              background: 'rgba(18, 26, 38, 0.95)',
              borderRadius: 6,
              border: '1px solid rgba(46, 213, 115, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 11, color: '#A0A8B4' }}>畅通路段</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#2ED573' }}>8</div>
            </div>
          </div>

          {/* 海峡通行指数浮层 */}
          <StraitTransitIndex />
        </div>

        <style>{`
          .panel-center {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
        `}</style>
      </div>

      {/* 底部图表条：压力预测 + 车流趋势 并排 */}
      <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <PressurePredictionChart compact />
        </div>
        <div className="module-card animate-in" style={{ flex: 1, animationDelay: '0.2s' }}>
          <div className="module-header">
            <span className="module-title">24h车流趋势</span>
            <div className="module-icon">
              <TrendingUp size={14} />
            </div>
          </div>
          <div style={{ height: 80 }}>
            <HourlyChart />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoadNetwork() {
  return (
    <>
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
        <ShipAnimations />

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

        <VehicleDefinitions />
        <VehicleAnimations />
        <TrafficLights />
      </svg>
    </>
  );
}

function ShipAnimations() {
  return (
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
  );
}

function VehicleDefinitions() {
  return (
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
  );
}

function VehicleAnimations() {
  return (
    <>
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
    </>
  );
}

function TrafficLights() {
  return (
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
  );
}


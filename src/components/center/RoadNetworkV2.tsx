/**
 * Enhanced Realistic Road Network
 * 增强的仿真道路网络
 */

import { COLORS_V2 } from '../../styles/designSystem';

export default function RoadNetwork() {
  return (
    <>
      {/* 地图底图 - 深色卫星风格 */}
      <svg
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        viewBox="0 0 760 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* 地形纹理 */}
          <pattern id="terrain" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="#0A0E1A"/>
            <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.02)"/>
            <circle cx="60" cy="40" r="1" fill="rgba(255,255,255,0.02)"/>
            <circle cx="80" cy="70" r="1" fill="rgba(255,255,255,0.02)"/>
          </pattern>

          {/* 道路渐变 - 畅通 */}
          <linearGradient id="roadSmooth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS_V2.traffic.smooth} stopOpacity="0.9"/>
            <stop offset="50%" stopColor={COLORS_V2.traffic.smooth} stopOpacity="1"/>
            <stop offset="100%" stopColor={COLORS_V2.traffic.smooth} stopOpacity="0.9"/>
          </linearGradient>

          {/* 道路渐变 - 一般 */}
          <linearGradient id="roadNormal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS_V2.traffic.normal} stopOpacity="0.9"/>
            <stop offset="50%" stopColor={COLORS_V2.traffic.normal} stopOpacity="1"/>
            <stop offset="100%" stopColor={COLORS_V2.traffic.normal} stopOpacity="0.9"/>
          </linearGradient>

          {/* 道路渐变 - 缓行 */}
          <linearGradient id="roadSlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS_V2.traffic.slow} stopOpacity="0.9"/>
            <stop offset="50%" stopColor={COLORS_V2.traffic.slow} stopOpacity="1"/>
            <stop offset="100%" stopColor={COLORS_V2.traffic.slow} stopOpacity="0.9"/>
          </linearGradient>

          {/* 道路渐变 - 拥堵 */}
          <linearGradient id="roadCongested" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS_V2.traffic.congested} stopOpacity="0.9"/>
            <stop offset="50%" stopColor={COLORS_V2.traffic.congested} stopOpacity="1"/>
            <stop offset="100%" stopColor={COLORS_V2.traffic.congested} stopOpacity="0.9"/>
          </linearGradient>

          {/* 道路渐变 - 严重拥堵 */}
          <linearGradient id="roadHeavy" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS_V2.traffic.heavy} stopOpacity="0.9"/>
            <stop offset="50%" stopColor={COLORS_V2.traffic.heavy} stopOpacity="1"/>
            <stop offset="100%" stopColor={COLORS_V2.traffic.heavy} stopOpacity="0.9"/>
          </linearGradient>

          {/* 道路发光效果 - Enhanced */}
          <filter id="roadGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feGaussianBlur stdDeviation="6" result="coloredBlur2"/>
            <feMerge>
              <feMergeNode in="coloredBlur2"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* 道路脉冲效果 */}
          <filter id="roadPulse">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feFlood floodColor="#3B82F6" floodOpacity="0.3" result="color"/>
            <feComposite in="color" in2="blur" operator="in" result="glow"/>
            <feMerge>
              <feMergeNode in="glow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
            <animate attributeName="stdDeviation" values="2;6;2" dur="2s" repeatCount="indefinite"/>
          </filter>

          {/* 道路标线 */}
          <pattern id="roadMarkings" width="20" height="4" patternUnits="userSpaceOnUse">
            <rect width="12" height="2" y="1" fill="rgba(255,255,255,0.6)"/>
          </pattern>
        </defs>

        {/* 地形背景 */}
        <rect width="100%" height="100%" fill="url(#terrain)"/>

        {/* 区域划分 - 使用更柔和的边界 */}
        <g opacity="0.15">
          {/* 港口区域 */}
          <rect x="500" y="250" width="250" height="140" fill={COLORS_V2.primary[900]} rx="4"/>
          <text x="625" y="320" fill={COLORS_V2.text.tertiary} fontSize="11" textAnchor="middle" opacity="0.5">港口区</text>

          {/* 城区 */}
          <rect x="200" y="50" width="300" height="200" fill={COLORS_V2.primary[900]} rx="4"/>
          <text x="350" y="150" fill={COLORS_V2.text.tertiary} fontSize="11" textAnchor="middle" opacity="0.5">城区</text>
        </g>
      </svg>

      {/* 道路网络 - 使用真实道路样式 */}
      <svg
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        viewBox="0 0 760 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <g filter="url(#roadGlow)">
          {/* === 主干道 - G207国道 === */}
          {/* 道路底层（深色） */}
          <path d="M30 100 L730 100" stroke="#1F2937" strokeWidth="14" strokeLinecap="round"/>
          {/* 道路主体 */}
          <path d="M30 100 L200 100" stroke="url(#roadNormal)" strokeWidth="10" strokeLinecap="round"/>
          <path d="M200 100 L450 100" stroke="url(#roadSlow)" strokeWidth="10" strokeLinecap="round"/>
          <path d="M450 100 L730 100" stroke="url(#roadSmooth)" strokeWidth="10" strokeLinecap="round"/>
          {/* 道路标线 */}
          <path d="M30 100 L730 100" stroke="url(#roadMarkings)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>

          {/* === S376省道 === */}
          <path d="M30 170 L730 170" stroke="#1F2937" strokeWidth="12" strokeLinecap="round"/>
          <path d="M30 170 L200 170" stroke="url(#roadNormal)" strokeWidth="8" strokeLinecap="round"/>
          <path d="M200 170 L450 170" stroke="url(#roadSlow)" strokeWidth="8" strokeLinecap="round"/>
          <path d="M450 170 L730 170" stroke="url(#roadNormal)" strokeWidth="8" strokeLinecap="round"/>
          <path d="M30 170 L730 170" stroke="url(#roadMarkings)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>

          {/* === 进港大道（主要拥堵路段）=== */}
          <path d="M550 100 L550 320" stroke="#1F2937" strokeWidth="16" strokeLinecap="round"/>
          <path d="M550 100 L550 180" stroke="url(#roadSlow)" strokeWidth="12" strokeLinecap="round"/>
          <path d="M550 180 L550 260" stroke="url(#roadCongested)" strokeWidth="12" strokeLinecap="round"/>
          <path d="M550 260 L550 320" stroke="url(#roadHeavy)" strokeWidth="12" strokeLinecap="round"/>
          <path d="M550 100 L550 320" stroke="url(#roadMarkings)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>

          {/* === 城东路 === */}
          <path d="M300 50 L300 200" stroke="#1F2937" strokeWidth="10" strokeLinecap="round"/>
          <path d="M300 50 L300 100" stroke="url(#roadNormal)" strokeWidth="7" strokeLinecap="round"/>
          <path d="M300 100 L300 170" stroke="url(#roadSlow)" strokeWidth="7" strokeLinecap="round"/>
          <path d="M300 170 L300 200" stroke="url(#roadNormal)" strokeWidth="7" strokeLinecap="round"/>

          {/* === 连接道路 === */}
          {/* 港口连接线 */}
          <path d="M550 320 L625 320" stroke="#1F2937" strokeWidth="10" strokeLinecap="round"/>
          <path d="M550 320 L625 320" stroke="url(#roadHeavy)" strokeWidth="7" strokeLinecap="round"/>

          {/* 环岛路 */}
          <path d="M200 100 L200 170" stroke="#1F2937" strokeWidth="8" strokeLinecap="round"/>
          <path d="M200 100 L200 170" stroke="url(#roadNormal)" strokeWidth="5" strokeLinecap="round"/>

          <path d="M450 100 L450 170" stroke="#1F2937" strokeWidth="8" strokeLinecap="round"/>
          <path d="M450 100 L450 170" stroke="url(#roadSmooth)" strokeWidth="5" strokeLinecap="round"/>
        </g>

        {/* 道路节点（路口） */}
        <g>
          <circle cx="200" cy="100" r="6" fill={COLORS_V2.primary[600]} opacity="0.8"/>
          <circle cx="300" cy="100" r="6" fill={COLORS_V2.primary[600]} opacity="0.8"/>
          <circle cx="450" cy="100" r="6" fill={COLORS_V2.primary[600]} opacity="0.8"/>
          <circle cx="550" cy="100" r="6" fill={COLORS_V2.primary[600]} opacity="0.8"/>
          <circle cx="200" cy="170" r="5" fill={COLORS_V2.primary[600]} opacity="0.8"/>
          <circle cx="300" cy="170" r="5" fill={COLORS_V2.primary[600]} opacity="0.8"/>
          <circle cx="450" cy="170" r="5" fill={COLORS_V2.primary[600]} opacity="0.8"/>
          <circle cx="550" cy="170" r="5" fill={COLORS_V2.primary[600]} opacity="0.8"/>
        </g>

        {/* 港口标识 */}
        <g>
          <rect x="615" y="310" width="20" height="20" fill={COLORS_V2.primary[700]} rx="2"/>
          <text x="625" y="323" fill={COLORS_V2.text.primary} fontSize="12" textAnchor="middle" fontWeight="bold">港</text>
          <circle cx="625" cy="320" r="15" fill="none" stroke={COLORS_V2.primary[500]} strokeWidth="1.5" opacity="0.5"/>
        </g>

        {/* 道路名称标签 */}
        <g fill={COLORS_V2.text.secondary} fontSize="10" fontWeight="500">
          <text x="100" y="90">G207国道</text>
          <text x="100" y="160">S376省道</text>
          <text x="560" y="200">进港大道</text>
        </g>
      </svg>

      {/* 交通流动画层 */}
      <svg
        style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 760 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* 车辆粒子 */}
          <radialGradient id="particleGlow">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="1"/>
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* G207 车流粒子 */}
        <circle r="4" fill="url(#particleGlow)">
          <animateMotion dur="6s" repeatCount="indefinite" path="M30 100 L730 100"/>
          <animate attributeName="opacity" values="0;1;1;0" dur="6s" repeatCount="indefinite"/>
        </circle>
        <circle r="4" fill="url(#particleGlow)">
          <animateMotion dur="6s" begin="2s" repeatCount="indefinite" path="M30 100 L730 100"/>
          <animate attributeName="opacity" values="0;1;1;0" dur="6s" begin="2s" repeatCount="indefinite"/>
        </circle>
        <circle r="4" fill="url(#particleGlow)">
          <animateMotion dur="6s" begin="4s" repeatCount="indefinite" path="M30 100 L730 100"/>
          <animate attributeName="opacity" values="0;1;1;0" dur="6s" begin="4s" repeatCount="indefinite"/>
        </circle>

        {/* S376 车流粒子 */}
        <circle r="3" fill="url(#particleGlow)">
          <animateMotion dur="7s" repeatCount="indefinite" path="M30 170 L730 170"/>
          <animate attributeName="opacity" values="0;1;1;0" dur="7s" repeatCount="indefinite"/>
        </circle>
        <circle r="3" fill="url(#particleGlow)">
          <animateMotion dur="7s" begin="3.5s" repeatCount="indefinite" path="M30 170 L730 170"/>
          <animate attributeName="opacity" values="0;1;1;0" dur="7s" begin="3.5s" repeatCount="indefinite"/>
        </circle>

        {/* 进港大道 车流粒子（密集 - 拥堵） */}
        <circle r="5" fill="url(#particleGlow)">
          <animateMotion dur="8s" repeatCount="indefinite" path="M550 100 L550 320"/>
          <animate attributeName="opacity" values="0;1;1;0" dur="8s" repeatCount="indefinite"/>
        </circle>
        <circle r="5" fill="url(#particleGlow)">
          <animateMotion dur="8s" begin="1.6s" repeatCount="indefinite" path="M550 100 L550 320"/>
          <animate attributeName="opacity" values="0;1;1;0" dur="8s" begin="1.6s" repeatCount="indefinite"/>
        </circle>
        <circle r="5" fill="url(#particleGlow)">
          <animateMotion dur="8s" begin="3.2s" repeatCount="indefinite" path="M550 100 L550 320"/>
          <animate attributeName="opacity" values="0;1;1;0" dur="8s" begin="3.2s" repeatCount="indefinite"/>
        </circle>
        <circle r="5" fill="url(#particleGlow)">
          <animateMotion dur="8s" begin="4.8s" repeatCount="indefinite" path="M550 100 L550 320"/>
          <animate attributeName="opacity" values="0;1;1;0" dur="8s" begin="4.8s" repeatCount="indefinite"/>
        </circle>
        <circle r="5" fill="url(#particleGlow)">
          <animateMotion dur="8s" begin="6.4s" repeatCount="indefinite" path="M550 100 L550 320"/>
          <animate attributeName="opacity" values="0;1;1;0" dur="8s" begin="6.4s" repeatCount="indefinite"/>
        </circle>

        {/* 港口脉冲环 */}
        <circle cx="625" cy="320" r="20" fill="none" stroke="#3B82F6" strokeWidth="1" opacity="0.5">
          <animate attributeName="r" values="15;30;15" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="625" cy="320" r="20" fill="none" stroke="#3B82F6" strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values="15;30;15" dur="3s" begin="1.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" begin="1.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </>
  );
}

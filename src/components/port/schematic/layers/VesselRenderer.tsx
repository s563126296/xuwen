// L9-L11: 船舶渲染层（尾迹 + 主体 + 标签）
import { usePortStore } from '../../../../stores/portStore';
import { geoToSvg } from '../hooks/useCoordinateMap';

export default function VesselRenderer() {
  const vessels = usePortStore((s) => s.vessels);

  return (
    <g>
      {vessels.map((vessel) => {
        const [x, y] = geoToSvg(vessel.position[0], vessel.position[1]);
        const statusColor =
          vessel.status === 'sailing' ? '#00D0E9' : vessel.status === 'docked' ? '#2ED573' : '#F5A623';

        return (
          <g key={vessel.id}>
            {/* L9: 尾迹光晕 */}
            <circle cx={x} cy={y} r={24} fill={statusColor} opacity={0.08}>
              <animate attributeName="r" values="20;28;20" dur="3s" repeatCount="indefinite" />
            </circle>

            {/* 脉冲底圈 */}
            <circle cx={x} cy={y} r={14} fill={statusColor} opacity={0.15}>
              <animate attributeName="r" values="12;16;12" dur="2.5s" repeatCount="indefinite" />
            </circle>

            {/* L10: 船舶主体（三角形，根据航向旋转） */}
            <g transform={`translate(${x},${y}) rotate(${vessel.course})`}>
              <polygon
                points="0,-6 4,4 -4,4"
                fill={statusColor}
                stroke="#fff"
                strokeWidth={1}
                opacity={0.95}
              />
            </g>

            {/* L11: 船舶名称 */}
            <text
              x={x}
              y={y - 18}
              fill="#c8dcff"
              fontSize={9}
              fontWeight={500}
              textAnchor="middle"
              style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
            >
              {vessel.name}
            </text>

            {/* 速度标签 */}
            <g transform={`translate(${x + 18}, ${y - 12})`}>
              <rect x={0} y={0} width={40} height={16} rx={3} fill="rgba(10,14,39,0.9)" stroke={statusColor} strokeWidth={0.8} />
              <text x={20} y={11} textAnchor="middle" fill={statusColor} fontSize={8}>
                {vessel.speed} kn
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}

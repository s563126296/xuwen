import { Settings, Truck, AlertCircle, Ship } from 'lucide-react';
import Modal from './Modal';
import { useDashboardStore } from '../store/dashboardStore';

interface Strategy {
  id: string;
  name: string;
  description: string;
  status: 'implemented' | 'implementing' | 'pending';
  applicableLevel: string;
  icon: typeof Settings;
}

const strategies: Strategy[] = [
  {
    id: 'signal',
    name: '交通信号优化',
    description: '调整进港路段交叉口信号灯配时，延长东西向绿灯时间15%，以缓解主干道压力',
    status: 'implemented',
    applicableLevel: '中度拥堵及以上',
    icon: Settings
  },
  {
    id: 'coldchain',
    name: '冷链车优先通行',
    description: '在港口周边道路设置冷链运输专用通道，保障生鲜食品运输时效',
    status: 'implementing',
    applicableLevel: '中度拥堵及以上',
    icon: Truck
  },
  {
    id: 'guidance',
    name: '交通信息诱导',
    description: '通过电子路牌引导车辆绕行至外围环线，减少市中心区域车流',
    status: 'pending',
    applicableLevel: '中度拥堵及以上',
    icon: AlertCircle
  },
  {
    id: 'port',
    name: '港口运力调度',
    description: '优化港口集装箱卸装作业流程，增加夜间作业时段，提升港口吞吐效率',
    status: 'pending',
    applicableLevel: '中度拥堵及以上',
    icon: Ship
  }
];

export default function StrategyModal() {
  const { selectedDirection, portData, selectedPort } = useDashboardStore();
  const port = portData[selectedPort];

  const getStatusStyle = (status: Strategy['status']) => {
    switch (status) {
      case 'implemented':
        return { bg: 'rgba(46, 213, 115, 0.1)', color: '#2ED573', border: 'rgba(46, 213, 115, 0.3)', label: '已实施' };
      case 'implementing':
        return { bg: 'rgba(0, 208, 233, 0.1)', color: '#00D0E9', border: 'rgba(0, 208, 233, 0.3)', label: '实施中' };
      case 'pending':
        return { bg: 'rgba(245, 166, 35, 0.1)', color: '#F5A623', border: 'rgba(245, 166, 35, 0.3)', label: '待实施' };
    }
  };

  return (
    <Modal id="strategy" title="交通拥堵调度策略" width={700}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Overview */}
        <div style={{
          padding: 16,
          background: 'rgba(245, 166, 35, 0.08)',
          borderRadius: 10,
          border: '1px solid rgba(245, 166, 35, 0.2)'
        }}>
          <div style={{ fontSize: 13, color: '#C9CDD4', lineHeight: 1.6 }}>
            <span style={{ color: '#F5A623', fontWeight: 500 }}>系统检测：</span>
            当前{selectedPort === 'overview' ? '双港' : port.name}
            <span style={{ color: selectedDirection === 'inbound' ? '#00D0E9' : '#F5A623' }}>
              {selectedDirection === 'inbound' ? '进港' : '出港'}
            </span>
            方向处于
            <span style={{ color: port.congestionIndex > 4 ? '#FF4757' : '#F5A623', fontWeight: 500 }}>
              {port.congestionIndex > 4 ? '中度拥堵' : '轻度拥堵'}
            </span>
            状态，拥堵指数{port.congestionIndex.toFixed(1)}，
            {port.congestionTime > 0 && `已持续${port.congestionTime}分钟，`}
            {port.congestionDistance > 0 && `影响范围约${port.congestionDistance}米，`}
            已触发调度策略推荐。
          </div>
        </div>

        {/* Strategy cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {strategies.map((strategy) => {
            const Icon = strategy.icon;
            const statusStyle = getStatusStyle(strategy.status);

            return (
              <div
                key={strategy.id}
                style={{
                  padding: 16,
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 10,
                  border: `1px solid ${statusStyle.border}`,
                  opacity: strategy.status === 'pending' ? 0.7 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: `${statusStyle.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={20} color={statusStyle.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
                        {strategy.name}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        background: statusStyle.bg,
                        border: `1px solid ${statusStyle.border}`,
                        borderRadius: 4,
                        fontSize: 11,
                        color: statusStyle.color
                      }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#A0A8B4', lineHeight: 1.5 }}>
                      {strategy.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: 12,
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 8,
          fontSize: 12,
          color: '#A0A8B4',
          textAlign: 'center'
        }}>
          策略内容为静态配置，后续可根据业务需要扩展为动态AI生成策略
        </div>
      </div>
    </Modal>
  );
}

import { useState } from 'react';
import Modal from '../Modal';
import { useCommandStore } from '../../stores/commandStore';
import { useUIStore } from '../../stores/uiStore';
import type {
  ExecutionRecord,
  ExecutionVersion,
  DeviationEvent,
  AILearning,
} from '../../stores/commandStore';

// ── helpers ──

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
}

function formatTs(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function deviationTypeLabel(t: DeviationEvent['type']): { label: string; color: string } {
  switch (t) {
    case 'strategy': return { label: '策略偏差', color: '#00D0E9' };
    case 'execution': return { label: '执行问题', color: '#F5A623' };
    case 'environment': return { label: '环境变化', color: '#A78BFA' };
  }
}

function outcomeLabel(record: ExecutionRecord, _startIndex: number, endIndex: number): { text: string; color: string } {
  const versions = record.versions;
  if (versions.length === 0) return { text: '—', color: '#64748B' };
  const lastVersion = versions[versions.length - 1];
  const lastCheckpoint = lastVersion.expectedCurve[lastVersion.expectedCurve.length - 1];
  if (!lastCheckpoint) return { text: '—', color: '#64748B' };
  const expectedEnd = lastCheckpoint.expected;
  if (endIndex < expectedEnd - 0.3) return { text: '超预期', color: '#2ED573' };
  if (endIndex <= expectedEnd + 0.3) return { text: '达预期', color: '#00D0E9' };
  return { text: '未达预期', color: '#F5A623' };
}

// ── section header style ──

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#00D0E9',
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: '1px solid rgba(0,208,233,0.2)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 12,
  marginBottom: 6,
};

// ── mock data for when no execution record exists ──

const mockRecord: ExecutionRecord = {
  id: 'mock-exec-1',
  strategyId: 'S-02',
  startTime: Date.now() - 85 * 60 * 1000,
  endTime: Date.now(),
  versions: [
    { version: 'v1', content: '原始方案：S376 全车型分流', reason: '初始策略', expectedCurve: [{ minutesAfter: 30, expected: 5.8 }, { minutesAfter: 60, expected: 5.2 }], timestamp: Date.now() - 85 * 60 * 1000 },
    { version: 'v2', content: '调整：S376 小客车 + S207 大货车', reason: 'S376 限高 3.5m，大货车无法通行', expectedCurve: [{ minutesAfter: 30, expected: 5.0 }, { minutesAfter: 60, expected: 4.2 }, { minutesAfter: 90, expected: 3.5 }], timestamp: Date.now() - 55 * 60 * 1000 },
  ],
  actualCurve: [
    { timestamp: Date.now() - 80 * 60 * 1000, congestionIndex: 6.5 },
    { timestamp: Date.now() - 40 * 60 * 1000, congestionIndex: 4.8 },
    { timestamp: Date.now(), congestionIndex: 2.9 },
  ],
  deviationEvents: [
    { timestamp: Date.now() - 70 * 60 * 1000, type: 'execution', reason: 'S376 限高障碍，大货车无法通行', action: '追加 S207 备用路线，合并为 v2', resolutionMinutes: 15 },
  ],
  resourceArrival: { estimated: 8, actual: 12 },
  rating: null,
  comment: '',
  aiLearnings: [
    { newFactor: '限高因子：S376 对大货车不可用（限高 3.5m）', affectedStrategies: ['S-02', 'S-07'], accuracyChange: { before: 82, after: 85 } },
    { newFactor: '联动规则：S-02 执行时若大货车 >30%，自动建议 S207', affectedStrategies: ['S-02'], accuracyChange: { before: 85, after: 87 } },
  ],
};

export default function CommandReportModal() {
  const commandState = useCommandStore((s) => s.commandState);
  const updateExecutionRecord = useCommandStore((s) => s.updateExecutionRecord);
  const setActiveModal = useUIStore((s) => s.setActiveModal);

  const { congestionIndex: _ci, predictedIndex: _pi, strategies, commandFeed: _cf, executionRecords, activeExecutionId } = commandState;

  // Try to find active execution record
  const execRecord: ExecutionRecord | null =
    activeExecutionId
      ? executionRecords.find((r) => r.id === activeExecutionId) ?? null
      : executionRecords.length > 0
        ? executionRecords[executionRecords.length - 1]
        : null;

  // Use execution record data or fall back to mock
  const record = execRecord ?? mockRecord;
  const hasRealRecord = execRecord !== null;

  // Derive metrics from record
  const startIndex = record.actualCurve.length > 0 ? record.actualCurve[0].congestionIndex : 6.5;
  const endIndex = record.actualCurve.length > 0 ? record.actualCurve[record.actualCurve.length - 1].congestionIndex : _ci;
  const durationMin = record.endTime
    ? Math.round((record.endTime - record.startTime) / 60000)
    : Math.round((Date.now() - record.startTime) / 60000);

  const strategyName = strategies.find((s) => s.id === record.strategyId)?.name ?? record.strategyId;
  const currentVersion = record.versions.length > 0 ? record.versions[record.versions.length - 1].version : 'v1';
  const outcome = outcomeLabel(record, startIndex, endIndex);

  // Deviation from expected
  const lastVersion = record.versions[record.versions.length - 1];
  const expectedDuration = lastVersion?.expectedCurve?.length
    ? lastVersion.expectedCurve[lastVersion.expectedCurve.length - 1].minutesAfter
    : durationMin;
  const deviationMin = durationMin - expectedDuration;
  const deviationText = deviationMin > 0 ? `+${deviationMin}min 超出预期` : deviationMin < 0 ? `${deviationMin}min 提前完成` : '符合预期';

  // Rating state
  const [selectedRating, setSelectedRating] = useState<'effective' | 'moderate' | 'ineffective' | null>(record.rating);
  const [comment, setComment] = useState(record.comment);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRating = () => {
    if (!selectedRating) return;
    if (hasRealRecord) {
      updateExecutionRecord(record.id, { rating: selectedRating, comment });
    }
    setSubmitted(true);
  };

  return (
    <Modal id="command-report" title="策略执行报告" width={640}>
      <div style={{
        background: 'rgba(13,27,42,0.95)',
        border: '1px solid rgba(0,208,233,0.25)',
        borderRadius: 6,
        padding: 20,
        backdropFilter: 'blur(10px)',
        maxHeight: '70vh',
        overflowY: 'auto',
      }}>
        {/* Report Header */}
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#64748B' }}>
            {formatDate(record.startTime)} {formatTs(record.startTime)} — {record.endTime ? formatTs(record.endTime) : '进行中'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginTop: 4 }}>
            {record.strategyId} {strategyName} ({currentVersion})
          </div>
        </div>

        {/* ── Section 1: Execution Overview ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={sectionHeaderStyle}>执行概况</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <MetricCard label="总耗时" value={formatDuration(durationMin)} color="#00D0E9" />
            <MetricCard label="拥堵指数" value={`${startIndex.toFixed(1)}→${endIndex.toFixed(1)}`} color="#2ED573" />
            <MetricCard label="偏差" value={deviationText} color={deviationMin > 0 ? '#F5A623' : '#2ED573'} />
            <MetricCard label="最终效果" value={outcome.text} color={outcome.color} />
          </div>
        </div>

        {/* ── Section 2: Version Iteration Timeline ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={sectionHeaderStyle}>版本迭代记录</div>
          <div style={{ paddingLeft: 4 }}>
            {record.versions.map((v, i) => (
              <VersionTimelineItem key={i} version={v} isLast={i === record.versions.length - 1} />
            ))}
            {record.versions.length === 0 && (
              <div style={{ fontSize: 12, color: '#64748B' }}>暂无版本记录</div>
            )}
          </div>
        </div>
        {/* ── Section 3: Deviation Events ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={sectionHeaderStyle}>偏差事件</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {record.deviationEvents.map((event, index) => {
              const tag = deviationTypeLabel(event.type);
              return (
                <div
                  key={index}
                  style={{
                    padding: 12,
                    background: '#0A1520',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={rowStyle}>
                    <span style={{ color: '#64748B' }}>{formatTs(event.timestamp)} 偏差触发</span>
                    <span style={{ color: tag.color, fontWeight: 600 }}>{tag.label}</span>
                  </div>
                  <div style={rowStyle}>
                    <span style={{ color: '#64748B' }}>原因</span>
                    <span style={{ color: '#E2E8F0', textAlign: 'right', maxWidth: '70%' }}>{event.reason}</span>
                  </div>
                  <div style={rowStyle}>
                    <span style={{ color: '#64748B' }}>处理方式</span>
                    <span style={{ color: '#E2E8F0', textAlign: 'right', maxWidth: '70%' }}>{event.action}</span>
                  </div>
                  <div style={{ ...rowStyle, marginBottom: 0 }}>
                    <span style={{ color: '#64748B' }}>解决耗时</span>
                    <span style={{ color: '#E2E8F0' }}>{event.resolutionMinutes} 分钟</span>
                  </div>
                </div>
              );
            })}
            {record.deviationEvents.length === 0 && (
              <div style={{ fontSize: 12, color: '#64748B' }}>本次执行无偏差事件</div>
            )}
          </div>
        </div>

        {/* ── Section 4: AI Learning ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={sectionHeaderStyle}>AI 学习</div>
          <div style={{
            padding: 14,
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {record.aiLearnings.map((item, index) => (
              <AILearningItem key={index} item={item} />
            ))}
            {record.aiLearnings.length === 0 && (
              <div style={{ fontSize: 12, color: '#C4B5FD' }}>暂无新增学习因子</div>
            )}
          </div>
        </div>
        {/* ── Section 5: User Rating ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={sectionHeaderStyle}>效果评价</div>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: 16, color: '#2ED573', fontSize: 13 }}>
              评价已提交，感谢反馈
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>请评价本次策略效果：</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([['effective', '有效', '#2ED573'], ['moderate', '一般', '#F5A623'], ['ineffective', '无效', '#FF4757']] as const).map(([val, label, color]) => (
                    <button
                      key={val}
                      onClick={() => setSelectedRating(val)}
                      style={{
                        padding: '4px 16px',
                        fontSize: 12,
                        borderRadius: 4,
                        cursor: 'pointer',
                        background: selectedRating === val ? `${color}22` : 'rgba(100,116,139,0.15)',
                        border: `1px solid ${selectedRating === val ? color : 'rgba(100,116,139,0.3)'}`,
                        color: selectedRating === val ? color : '#94A3B8',
                        transition: 'all 0.2s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="补充说明（可选）：如有特殊情况或改进建议，请在此输入..."
                style={{
                  width: '100%',
                  height: 60,
                  background: '#0A1520',
                  border: '1px solid rgba(100,116,139,0.3)',
                  borderRadius: 8,
                  padding: 10,
                  color: '#B0C0D0',
                  fontSize: 12,
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingTop: 12, borderTop: '1px solid rgba(0,208,233,0.1)' }}>
          {!submitted && (
            <button
              onClick={handleSubmitRating}
              disabled={!selectedRating}
              style={{
                padding: '8px 24px',
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 4,
                cursor: selectedRating ? 'pointer' : 'not-allowed',
                background: selectedRating ? 'rgba(0,208,233,0.2)' : 'rgba(100,116,139,0.1)',
                border: `1px solid ${selectedRating ? 'rgba(0,208,233,0.4)' : 'rgba(100,116,139,0.2)'}`,
                color: selectedRating ? '#00D0E9' : '#64748B',
                transition: 'all 0.2s',
              }}
            >
              提交评价
            </button>
          )}
          <button
            onClick={() => setActiveModal(null)}
            style={{
              padding: '8px 24px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 4,
              cursor: 'pointer',
              background: 'rgba(100,116,139,0.15)',
              border: '1px solid rgba(100,116,139,0.3)',
              color: '#94A3B8',
              transition: 'all 0.2s',
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Sub-components ──

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: '#0A1520',
      borderRadius: 6,
      padding: '10px 8px',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748B' }}>{label}</div>
    </div>
  );
}

function VersionTimelineItem({ version, isLast }: { version: ExecutionVersion; isLast: boolean }) {
  return (
    <div style={{
      display: 'flex',
      gap: 10,
      position: 'relative',
      paddingBottom: isLast ? 0 : 14,
    }}>
      {/* Timeline line + dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 12 }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#00D0E9',
          border: '2px solid rgba(0,208,233,0.4)',
          flexShrink: 0,
          marginTop: 3,
        }} />
        {!isLast && (
          <div style={{
            width: 2,
            flex: 1,
            background: 'rgba(0,208,233,0.2)',
            marginTop: 4,
          }} />
        )}
      </div>
      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#0A0F19',
            background: '#00D0E9',
            borderRadius: 3,
            padding: '1px 6px',
          }}>
            {version.version}
          </span>
          <span style={{ fontSize: 12, color: '#E2E8F0' }}>{version.content}</span>
        </div>
        <div style={{ fontSize: 11, color: '#556677' }}>
          {version.reason && <>原因：{version.reason}</>}
          {version.expectedCurve.length > 0 && (
            <> | 预期 {version.expectedCurve[version.expectedCurve.length - 1].minutesAfter}min 后 →{version.expectedCurve[version.expectedCurve.length - 1].expected}</>
          )}
        </div>
      </div>
    </div>
  );
}

function AILearningItem({ item }: { item: AILearning }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 12, color: '#E2E8F0' }}>
        {item.newFactor}
      </div>
      <div style={{ fontSize: 11, color: '#A78BFA', display: 'flex', gap: 12 }}>
        <span>
          准确率：{item.accuracyChange.before}% → {item.accuracyChange.after}%
          （+{item.accuracyChange.after - item.accuracyChange.before}%）
        </span>
        <span>影响策略：{item.affectedStrategies.join(', ')}</span>
      </div>
    </div>
  );
}

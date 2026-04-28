import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MessageSquare } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';
import { handleInquiryResponse } from '../../utils/strategyMonitorEngine';

export default function InquiryModal() {
  const inquiry = useCommandStore((s) => s.commandState.monitorState.activeInquiry);
  const deviationPercent = useCommandStore((s) => s.commandState.monitorState.deviationPercent);
  const congestionIndex = useCommandStore((s) => s.commandState.congestionIndex);
  const [customInput, setCustomInput] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!inquiry || inquiry.status !== 'pending' || inquiry.target !== 'commander') return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [inquiry?.id]);

  if (!inquiry || inquiry.status !== 'pending' || inquiry.target !== 'commander') return null;

  const handleSelect = (answer: string) => { handleInquiryResponse(answer); };
  const handleCustomSubmit = () => {
    if (customInput.trim()) { handleInquiryResponse(customInput.trim()); setCustomInput(''); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
      <div style={{ width: 420, background: '#0D1137', border: '1px solid rgba(255, 71, 87, 0.5)', borderRadius: 12, padding: 24, boxShadow: '0 8px 32px rgba(255, 71, 87, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <AlertTriangle size={20} color="#FF4757" />
          <span style={{ color: '#FF4757', fontSize: 15, fontWeight: 600 }}>AI 检测到策略执行偏差</span>
        </div>

        <div style={{ background: 'rgba(255, 71, 87, 0.1)', border: '1px solid rgba(255, 71, 87, 0.2)', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: '#E0E8FF', lineHeight: 1.8 }}>
          当前拥堵指数 <span style={{ color: '#FF4757', fontWeight: 600 }}>{congestionIndex.toFixed(1)}</span>
          ，偏差 <span style={{ color: '#FF4757', fontWeight: 600 }}>{deviationPercent}%</span>
          <br />{inquiry.question}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {inquiry.options.map((opt) => (
            <button key={opt} onClick={() => handleSelect(opt)} style={{ padding: '10px 14px', background: 'rgba(0, 208, 233, 0.05)', border: '1px solid rgba(0, 208, 233, 0.2)', borderRadius: 6, color: '#E0E8FF', fontSize: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 208, 233, 0.15)'; e.currentTarget.style.borderColor = '#00D0E9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 208, 233, 0.05)'; e.currentTarget.style.borderColor = 'rgba(0, 208, 233, 0.2)'; }}>
              {opt}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={customInput} onChange={(e) => setCustomInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()} placeholder="其他原因..." style={{ flex: 1, padding: '8px 12px', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 6, color: '#E0E8FF', fontSize: 12, outline: 'none' }} />
          <button onClick={handleCustomSubmit} style={{ padding: '8px 14px', background: '#00D0E9', border: 'none', borderRadius: 6, color: '#0A0F19', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <MessageSquare size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#94A3B8', fontSize: 11 }}>
          <Clock size={12} />
          <span>{countdown}s 后自动选择「继续观察」</span>
        </div>
      </div>
    </div>
  );
}

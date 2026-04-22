import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useAIAnalysisStore } from '../../stores';

export default function TimelineController() {
  const viewMode = useAIAnalysisStore((s) => s.viewMode);
  const setViewMode = useAIAnalysisStore((s) => s.setViewMode);
  const isPlaying = useAIAnalysisStore((s) => s.isPlaying);
  const setIsPlaying = useAIAnalysisStore((s) => s.setIsPlaying);
  const speed = useAIAnalysisStore((s) => s.playbackSpeed);
  const setSpeed = useAIAnalysisStore((s) => s.setPlaybackSpeed);
  const progress = useAIAnalysisStore((s) => s.timelineProgress);
  const setProgress = useAIAnalysisStore((s) => s.setTimelineProgress);

  const modes = [
    { id: 'realtime' as const, label: '实时' },
    { id: 'history' as const, label: '历史' },
    { id: 'prediction' as const, label: '预测' },
  ];

  const speeds = [1, 2, 4];

  return (
    <div className="timeline-controller">
      <div className="timeline-controller__modes">
        {modes.map((mode) => (
          <button
            key={mode.id}
            className={`timeline-mode-btn ${viewMode === mode.id ? 'active' : ''}`}
            onClick={() => setViewMode(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="timeline-controller__controls">
        <button className="timeline-control-btn" onClick={() => setProgress(Math.max(0, progress - 10))}>
          <SkipBack size={16} />
        </button>

        <button
          className="timeline-control-btn timeline-control-btn--play"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <button className="timeline-control-btn" onClick={() => setProgress(Math.min(100, progress + 10))}>
          <SkipForward size={16} />
        </button>

        <div className="timeline-progress">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="timeline-slider"
          />
          <div className="timeline-progress__fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="timeline-time">
          <span>14:23:45</span>
        </div>

        <div className="timeline-speed">
          {speeds.map((s) => (
            <button
              key={s}
            className={`timeline-speed-btn ${speed === s ? 'active' : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

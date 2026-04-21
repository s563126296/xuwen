import { useMemo } from 'react';
import DeviceIconLayer from './base/DeviceIconLayer';
import CoverageAreaLayer from './base/CoverageAreaLayer';
import StatusAnimLayer from './base/StatusAnimLayer';
import cameraData from '../../../../data/geo/cameras.json';
import securityCameraSvg from './assets/security-camera.svg';

const STATUS_COLORS = {
  normal: '#60a5fa',
  abnormal: '#fbbf24',
  triggered: '#ff4757',
  offline: '#6b7280',
};

/**
 * 治安监控图层
 * - 用于普通视频监控摄像头，不混入电子警察/卡口设备
 * - 正常状态保持静态，只有异常或告警状态才由 StatusAnimLayer 提示
 */
export default function SecurityCameraLayer() {
  const points = useMemo(() => {
    const devices = cameraData.filter((d) => d.type === '治安监控');
    return devices.map((d) => ({
      lng: d.coordinates[0],
      lat: d.coordinates[1],
      id: d.id,
      name: d.name,
      type: d.type,
      status: (d as any).status || 'normal',
      bearing: (d as any).bearing || 0,
      captureCount: (d as any).metadata?.captureCount ?? 0,
      alertsToday: (d as any).metadata?.alertsToday ?? 0,
      coverage: (d as any).metadata?.coverage ?? '道路视频巡检',
    }));
  }, []);

  const coveragePoints = useMemo(
    () => points.map((p) => ({ ...p, radius: 90 })),
    [points],
  );

  if (points.length === 0) return null;

  return (
    <>
      <CoverageAreaLayer
        shapeType="circle"
        points={coveragePoints}
        fillColor="rgba(96,165,250,0.08)"
        opacity={0.06}
        zIndex={4}
      />
      <DeviceIconLayer
        svgPath={securityCameraSvg}
        points={points}
        size={24}
        opacity={0.9}
        zIndex={8}
        entityType="security-camera"
        tooltipFormatter={(p) => `${p.name} | 治安监控\n巡检: ${p.captureCount}次 | AI告警: ${p.alertsToday}起\n覆盖: ${p.coverage}\n状态: ${p.status === 'triggered' ? '告警' : p.status === 'offline' ? '离线' : '正常'}`}
      />
      <StatusAnimLayer
        points={points}
        animationType="pulse"
        colors={STATUS_COLORS}
        zIndex={6}
      />
    </>
  );
}

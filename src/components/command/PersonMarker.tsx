import { useEffect, useRef } from 'react';
import type { FieldPerson } from '../../stores/commandStore';

interface PersonMarkerProps {
  person: FieldPerson;
  map: any; // AMap.Map
  onClick?: (person: FieldPerson) => void;
  isSelected?: boolean;
}

export default function PersonMarker({ person, map, onClick, isSelected }: PersonMarkerProps) {
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !(window as any).AMap) return;

    const AMap = (window as any).AMap;

    // 创建自定义 HTML Marker
    const content = document.createElement('div');
    content.style.cssText = `
      position: relative;
      width: 28px;
      height: 28px;
      cursor: pointer;
    `;

    // 选中光晕
    if (isSelected) {
      const glow = document.createElement('div');
      glow.style.cssText = `
        position: absolute;
        top: -6px;
        left: -6px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,208,233,0.3) 0%, transparent 70%);
        z-index: 0;
        animation: glowPulse 2s infinite;
      `;
      content.appendChild(glow);
    }

    // 头像圆圈
    const avatar = document.createElement('div');
    avatar.style.cssText = `
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: ${person.avatar};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: #0A0F19;
      position: relative;
      z-index: 2;
    `;
    avatar.textContent = person.name.charAt(0);

    // 状态外圈
    if (person.status !== 'idle') {
      const ring = document.createElement('div');
      const ringColor = person.status === 'executing' ? '#00D0E9' :
                        person.status === 'moving' ? '#2ED573' :
                        person.status === 'calling' ? '#FF4757' : '#00D0E9';

      ring.style.cssText = `
        position: absolute;
        top: -4px;
        left: -4px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid ${ringColor};
        z-index: 1;
        ${person.status === 'calling' ? 'animation: pulse 1s infinite;' : ''}
      `;
      content.appendChild(ring);
    }

    // 底部三角
    const triangle = document.createElement('div');
    triangle.style.cssText = `
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 6px solid ${person.avatar};
      z-index: 1;
    `;

    content.appendChild(avatar);
    content.appendChild(triangle);

    // 添加脉冲动画样式
    if (person.status === 'calling') {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `;
      document.head.appendChild(style);
    }

    // Add glow animation style (check if not already added)
    if (isSelected && !document.getElementById('glow-pulse-style')) {
      const style = document.createElement('style');
      style.id = 'glow-pulse-style';
      style.textContent = `
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `;
      document.head.appendChild(style);
    }

    // 创建 Marker
    const marker = new AMap.Marker({
      position: new AMap.LngLat(person.position[0], person.position[1]),
      content,
      offset: new AMap.Pixel(-14, -28),
      zIndex: 200,
    });

    marker.setMap(map);
    markerRef.current = marker;

    // 点击事件
    marker.on('click', () => {
      const contentEl = marker.getContent();
      if (contentEl) {
        contentEl.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        contentEl.style.transform = 'scale(0.9)';
        setTimeout(() => {
          contentEl.style.transform = 'scale(1.0)';
        }, 100);
      }
      if (onClick) onClick(person);
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [map, person, onClick, isSelected]);

  return null;
}

import { useEffect } from 'react';

interface Strategy {
  id: string;
  status: string;
}

export function useStrategyPulseEffects(
  mapReady: boolean,
  strategies: Strategy[],
  diversionLineRef: React.MutableRefObject<any>,
  diversionLabelRef: React.MutableRefObject<any>,
  pulseLineRef: React.MutableRefObject<any>
) {
  useEffect(() => {
    if (!mapReady) return;

    const executingStrategy = strategies.find(s => s.status === 'executing');

    // S-02 执行中：S376 分流路线脉冲
    let diversionOpacity = 0.3;
    let diversionDirection = 1;
    let diversionInterval: number | null = null;

    if (executingStrategy?.id === 'S-02' && diversionLineRef.current && diversionLabelRef.current) {
      diversionInterval = window.setInterval(() => {
        diversionOpacity += diversionDirection * 0.7;
        if (diversionOpacity >= 1.0) {
          diversionOpacity = 1.0;
          diversionDirection = -1;
        } else if (diversionOpacity <= 0.3) {
          diversionOpacity = 0.3;
          diversionDirection = 1;
        }
        diversionLineRef.current?.setOptions({ strokeOpacity: diversionOpacity });
      }, 1000);

      if (diversionLabelRef.current.setText && diversionLabelRef.current.setStyle) {
        diversionLabelRef.current.setText('S376 分流执行中 ●');
        diversionLabelRef.current.setStyle({
          'font-size': '11px',
          'font-weight': '600',
          color: '#00D0E9',
          'background-color': 'rgba(0,208,233,0.15)',
          border: '1px solid rgba(0,208,233,0.3)',
          'border-radius': '4px',
          padding: '3px 8px',
        });
      }
    } else if (diversionLineRef.current && diversionLabelRef.current) {
      if (diversionLabelRef.current.setText && diversionLabelRef.current.setStyle) {
        diversionLineRef.current.setOptions({ strokeOpacity: 0.6 });
        diversionLabelRef.current.setText('S376 建议分流路线');
        diversionLabelRef.current.setStyle({
          'font-size': '11px',
          'font-weight': '600',
          color: '#2ED573',
          'background-color': 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.3)',
          'border-radius': '4px',
          padding: '3px 8px',
        });
      }
    }

    // S-01 执行中：进港大道青色脉冲
    let roadOpacity = 0;
    let roadDirection = 1;
    let roadInterval: number | null = null;

    if (executingStrategy?.id === 'S-01' && pulseLineRef.current) {
      roadInterval = window.setInterval(() => {
        roadOpacity += roadDirection * 0.8;
        if (roadOpacity >= 0.8) {
          roadOpacity = 0.8;
          roadDirection = -1;
        } else if (roadOpacity <= 0) {
          roadOpacity = 0;
          roadDirection = 1;
        }
        pulseLineRef.current?.setOptions({ strokeOpacity: roadOpacity });
      }, 1000);
    } else if (pulseLineRef.current) {
      pulseLineRef.current.setOptions({ strokeOpacity: 0 });
    }

    return () => {
      if (diversionInterval) clearInterval(diversionInterval);
      if (roadInterval) clearInterval(roadInterval);
    };
  }, [mapReady, strategies, diversionLineRef, diversionLabelRef, pulseLineRef]);
}

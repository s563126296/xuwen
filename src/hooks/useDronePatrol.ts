import { useEffect, useRef } from 'react';
import { JINGANG_ROAD } from '../constants';

export function useDronePatrol(
  mapReady: boolean,
  isDroneDeployed: boolean,
  droneMarkerRef: React.MutableRefObject<any>,
  mapInstance: React.MutableRefObject<any>
) {
  const dronePatrolIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const droneTrajectoryRef = useRef<any>(null);

  useEffect(() => {
    if (!mapReady || !droneMarkerRef.current) return;

    const droneMarker = droneMarkerRef.current;

    if (dronePatrolIntervalRef.current) {
      clearInterval(dronePatrolIntervalRef.current);
      dronePatrolIntervalRef.current = null;
    }

    if (isDroneDeployed) {
      droneMarker.setPosition(JINGANG_ROAD[1]);
      droneMarker.show();

      const patrolPath = [
        JINGANG_ROAD[1],
        JINGANG_ROAD[2],
        JINGANG_ROAD[3],
        JINGANG_ROAD[4],
        JINGANG_ROAD[5],
      ];

      let pathIndex = 0;
      let direction = 1;
      let currentPos: [number, number] = [JINGANG_ROAD[1][0], JINGANG_ROAD[1][1]];
      let targetPos = patrolPath[1];

      dronePatrolIntervalRef.current = setInterval(() => {
        const dx = targetPos[0] - currentPos[0];
        const dy = targetPos[1] - currentPos[1];
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.0002) {
          pathIndex += direction;

          if (pathIndex >= patrolPath.length) {
            pathIndex = patrolPath.length - 2;
            direction = -1;
          } else if (pathIndex < 0) {
            pathIndex = 1;
            direction = 1;
          }

          targetPos = patrolPath[pathIndex];
        }

        const moveSpeed = 0.00035;
        const ratio = distance > 0 ? moveSpeed / distance : 0;
        currentPos = [
          currentPos[0] + dx * ratio,
          currentPos[1] + dy * ratio,
        ];

        droneMarker.setPosition(currentPos);

        // Update trajectory line
        if (!droneTrajectoryRef.current && mapInstance.current && (window as any).AMap) {
          const AMap = (window as any).AMap;
          droneTrajectoryRef.current = new AMap.Polyline({
            path: [],
            strokeColor: '#00D0E9',
            strokeWeight: 2,
            strokeOpacity: 0.4,
            strokeStyle: 'dashed',
            strokeDasharray: [10, 5],
            zIndex: 150,
          });
          droneTrajectoryRef.current.setMap(mapInstance.current);
        }

        if (droneTrajectoryRef.current && (window as any).AMap) {
          const AMap = (window as any).AMap;
          const path = droneTrajectoryRef.current.getPath() || [];
          path.push(new AMap.LngLat(currentPos[0], currentPos[1]));
          if (path.length > 20) {
            path.shift();
          }
          droneTrajectoryRef.current.setPath(path);
        }
      }, 100);

      return () => {
        if (dronePatrolIntervalRef.current) {
          clearInterval(dronePatrolIntervalRef.current);
          dronePatrolIntervalRef.current = null;
        }
        if (droneTrajectoryRef.current) {
          droneTrajectoryRef.current.setMap(null);
          droneTrajectoryRef.current = null;
        }
      };
    } else {
      droneMarker.hide();
      if (droneTrajectoryRef.current) {
        droneTrajectoryRef.current.setMap(null);
        droneTrajectoryRef.current = null;
      }
    }
  }, [isDroneDeployed, mapReady, droneMarkerRef, mapInstance]);
}

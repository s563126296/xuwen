import { useEffect } from 'react';
import { usePortStore } from '../../stores/portStore';
import lanesData from '../../data/geo/lanes.json';

interface Lane {
  id: string;
  coordinates: [number, number][];
}

const isGeoPoint = (coord: unknown): coord is [number, number] =>
  Array.isArray(coord) &&
  coord.length >= 2 &&
  Number.isFinite(coord[0]) &&
  Number.isFinite(coord[1]);

const lanes: Lane[] = lanesData.map((lane) => ({
  id: lane.id,
  coordinates: lane.coordinates.filter(isGeoPoint).map(([lng, lat]) => [lng, lat]),
}));

function interpolatePosition(coords: [number, number][], progress: number): [number, number] {
  if (coords.length === 0) return [0, 0];
  if (coords.length === 1) return [coords[0][0], coords[0][1]];

  const totalPoints = coords.length;
  const exactIndex = progress * (totalPoints - 1);
  const i = Math.floor(exactIndex);
  const t = exactIndex - i;

  if (i >= totalPoints - 1) return [coords[totalPoints - 1][0], coords[totalPoints - 1][1]];

  const lng1 = coords[i][0];
  const lat1 = coords[i][1];
  const lng2 = coords[i + 1][0];
  const lat2 = coords[i + 1][1];

  return [
    lng1 + (lng2 - lng1) * t,
    lat1 + (lat2 - lat1) * t,
  ];
}

function updateVesselTrail(
  oldTrail: [number, number][],
  newPosition: [number, number]
): [number, number][] {
  const newTrail = [...oldTrail, newPosition];
  return newTrail.slice(-5);
}

export default function PortSimulator() {
  const vessels = usePortStore((s) => s.vessels);
  const queue = usePortStore((s) => s.queue);
  const straitIndex = usePortStore((s) => s.straitIndex);
  const weather = usePortStore((s) => s.weather);
  const updateVessels = usePortStore((s) => s.updateVessels);
  const updateQueue = usePortStore((s) => s.updateQueue);
  const updateStraitIndex = usePortStore((s) => s.updateStraitIndex);
  const updateWeather = usePortStore((s) => s.updateWeather);

  // 船舶移动动画（每 2 秒更新一次）
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedVessels = vessels.map((vessel) => {
        let targetLane: Lane | undefined;

        if (vessel.laneId === 'xuwen-xinhai') {
          targetLane = lanes.find((l) => l.id.includes('徐闻港') && l.id.includes('新海港'));
        } else if (vessel.laneId === 'haian-xiuying') {
          targetLane = lanes.find((l) => l.id.includes('海安新港') && l.id.includes('秀英港'));
        } else if (vessel.laneId === 'haian-nangang') {
          targetLane = lanes.find((l) => l.id.includes('粤海轮渡线'));
        }

        if (!targetLane) return vessel;

        // 根据速度更新 progress（速度越快，移动越快）
        const progressDelta = vessel.speed * 0.0005;
        let newProgress = vessel.progress + progressDelta;

        // 循环航行
        if (newProgress > 1) newProgress = 0;

        const newPosition = interpolatePosition(targetLane.coordinates, newProgress);
        const newTrail = updateVesselTrail(vessel.trail, newPosition);

        return {
          ...vessel,
          position: newPosition,
          progress: newProgress,
          trail: newTrail,
        };
      });

      updateVessels(updatedVessels);
    }, 2000);

    return () => clearInterval(interval);
  }, [vessels, updateVessels]);

  // 队列数据波动（每 10 秒）
  useEffect(() => {
    const interval = setInterval(() => {
      const fluctuation = Math.floor(Math.random() * 40 - 20); // -20 到 +20
      const newTotal = Math.max(0, queue.totalVehicles + fluctuation);

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      const newTrend = [...queue.trend.slice(1), { time: currentTime, count: newTotal }];

      updateQueue({
        ...queue,
        totalVehicles: newTotal,
        estimatedWait: Math.max(15, Math.floor(newTotal / 20)),
        trend: newTrend,
        byType: {
          car: Math.floor(newTotal * 0.65),
          truck: Math.floor(newTotal * 0.28),
          hazmat: Math.floor(newTotal * 0.07),
        },
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [queue, updateQueue]);

  // 通行指数和天气微调（每 15 秒）
  useEffect(() => {
    const interval = setInterval(() => {
      const indexDelta = Math.floor(Math.random() * 5 - 2); // -2 到 +2
      const newScore = Math.min(100, Math.max(0, straitIndex.score + indexDelta));

      updateStraitIndex({
        ...straitIndex,
        score: newScore,
        navigationStatus: newScore >= 60 ? 'open' : newScore >= 40 ? 'restricted' : 'closed',
      });

      const windDelta = Math.random() * 0.8 - 0.4;
      const visibilityDelta = Math.random() * 1 - 0.5;
      const waveDelta = Math.random() * 0.2 - 0.1;

      const newWindSpeed = Math.max(0, weather.windSpeed + windDelta);
      const suspensionWarning = newWindSpeed > 13 || weather.forecast[0].visibility < 1;

      updateWeather({
        ...weather,
        windSpeed: Number(newWindSpeed.toFixed(1)),
        suspensionWarning,
        forecast: weather.forecast.map((item, idx) =>
          idx === 0
            ? {
                ...item,
                visibility: Math.max(0.5, Number((item.visibility + visibilityDelta).toFixed(1))),
                waveHeight: Math.max(0, Number((item.waveHeight + waveDelta).toFixed(1))),
              }
            : item
        ),
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [straitIndex, weather, updateStraitIndex, updateWeather]);

  return null;
}

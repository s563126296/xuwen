import { useState } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';

const hourlyData = [
  { hour: '00', value: 2800 },
  { hour: '02', value: 1800 },
  { hour: '04', value: 1200 },
  { hour: '06', value: 3200 },
  { hour: '08', value: 5800 },
  { hour: '10', value: 7200 },
  { hour: '12', value: 6500 },
  { hour: '14', value: 6800 },
  { hour: '16', value: 7200 },
  { hour: '18', value: 5800 },
  { hour: '20', value: 4200 },
  { hour: '22', value: 3500 },
];

export default function HourlyChart() {
  const [activeIndex, setActiveIndex] = useState(-1);
  const currentHour = new Date().getHours();
  const currentSlot = Math.floor(currentHour / 2);

  const getBarColor = (index: number) => {
    if (index === currentSlot) return '#00D0E9';
    if (hourlyData[index].value > 6000) return '#F5A623';
    if (hourlyData[index].value > 4000) return '#7B68EE';
    return '#2ED573';
  };

  return (
    <div style={{ height: 120, padding: '4px 0' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={hourlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="hour"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#A0A8B4', fontSize: 11 }}
          />
          <Bar
            dataKey="value"
            radius={[2, 2, 0, 0]}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(-1)}
          >
            {hourlyData.map((_, index) => (
              <Cell
                key={index}
                fill={getBarColor(index)}
                style={{
                  filter: activeIndex === index ? 'brightness(1.3)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

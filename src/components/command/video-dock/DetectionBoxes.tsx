interface DetectionBox {
  top: string;
  left: string;
  width: number;
  height: number;
  color: string;
  label: string;
  speed: string;
}

interface DetectionBoxesProps {
  boxes: DetectionBox[];
  labelFontSize?: number;
  speedFontSize?: number;
  labelOffset?: number;
  speedOffset?: number;
  padding?: string;
}

export default function DetectionBoxes({
  boxes,
  labelFontSize = 9,
  speedFontSize = 8,
  labelOffset = -20,
  speedOffset = -18,
  padding = '2px 5px',
}: DetectionBoxesProps) {
  return (
    <>
      {boxes.map((box, idx) => (
        <div key={idx} style={{
          position: 'absolute',
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
          border: `2px solid ${box.color}`,
          borderRadius: 4,
          zIndex: 3,
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            top: labelOffset,
            left: 0,
            fontSize: labelFontSize,
            color: box.color,
            background: 'rgba(0,0,0,0.8)',
            padding,
            borderRadius: 3,
            whiteSpace: 'nowrap'
          }}>
            {box.label}
          </div>
          <div style={{
            position: 'absolute',
            bottom: speedOffset,
            left: 0,
            fontSize: speedFontSize,
            color: box.color,
            background: 'rgba(0,0,0,0.8)',
            padding,
            borderRadius: 3,
            whiteSpace: 'nowrap'
          }}>
            {box.speed}
          </div>
        </div>
      ))}
    </>
  );
}

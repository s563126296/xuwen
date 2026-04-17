import { useEffect, useRef, useState } from 'react';
import './bigscreen/bigscreen.css';
import BigScreenHeader from './bigscreen/BigScreenHeader';
import BigScreenLeft from './bigscreen/BigScreenLeft';
import BigScreenCenter from './bigscreen/BigScreenCenter';
import BigScreenRight from './bigscreen/BigScreenRight';
import UrbanHealthPanel from './bigscreen/panels/UrbanHealthPanel';
import PressureChainPanel from './bigscreen/panels/PressureChainPanel';

export default function BigScreen() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (!wrapperRef.current) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const designWidth = 1920;
      const designHeight = 1080;

      const scaleX = viewportWidth / designWidth;
      const scaleY = viewportHeight / designHeight;
      setScale(Math.min(scaleX, scaleY));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bs-wrapper" ref={wrapperRef}>
      <div
        className="bs-container"
        style={{ transform: `scale(${scale})` }}
      >
        <BigScreenHeader />
        <div className="bs-body">
          <BigScreenLeft />
          <BigScreenCenter />
          <BigScreenRight />
        </div>
        <div className="bs-footer">
          <UrbanHealthPanel />
          <PressureChainPanel />
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { formatTime } from "../helpers/time";

interface TimerProps {
  startTime: number;
  stop: boolean;
}

const Timer: React.FC<TimerProps> = ({ startTime = Date.now(), stop }) => {
  const [animatedValue, setAnimatedValue] = useState<number>(0);

  useEffect(() => {
    const animate = () => {
      const delta = Date.now() - startTime;
      if (!stop) setAnimatedValue(delta);
    };

    const interval = setInterval(animate, 0);

    return () => clearInterval(interval);
  }, [animatedValue, startTime, stop]);

  return (
    <div className="font-mono text-lg tabular-nums">
      {formatTime(animatedValue)}
    </div>
  );
};

export default Timer;

import React, { useState, useEffect } from "react";
import { formatTime } from "../helpers/time";

interface TimerProps {
  startTime: number;
  running: boolean;
}

const Timer: React.FC<TimerProps> = ({ startTime = Date.now(), running }) => {
  const [animatedValue, setAnimatedValue] = useState<number>(0);

  useEffect(() => {
    const animate = () => {
      const delta = Date.now() - startTime;
      if (running) setAnimatedValue(delta);
    };

    const interval = setInterval(animate, 0);

    return () => clearInterval(interval);
  }, [startTime, running]);

  useEffect(() => {
    if (startTime === 0) {
      setAnimatedValue(0);
    } else {
      setAnimatedValue(Date.now() - startTime);
    }
  }, [startTime]);

  return (
    <div className="font-mono text-xl tabular-nums">
      {formatTime(animatedValue)}
    </div>
  );
};

export default Timer;

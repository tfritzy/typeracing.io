import { Timestamp } from "@shared/types";
import { useEffect, useState } from "react";

type Props = {
  getNow: () => Timestamp;
  startTime: Timestamp;
};

export function Countdown({ getNow, startTime }: Props) {
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    let frameId: number;

    const updateTime = () => {
      const currentTime = getNow().toMillis();
      const startTimeMs = startTime.toMillis();
      const timeLeft = Math.max(
        0,
        Math.ceil((startTimeMs - currentTime) / 1000)
      );

      setRemainingTime(timeLeft);

      if (timeLeft > 0) {
        frameId = requestAnimationFrame(updateTime);
      }
    };

    updateTime();

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [getNow, startTime]);

  if (remainingTime > 0) {
    return `Game starting in ${remainingTime}s`;
  } else {
    return "Type!";
  }
}

import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

type Props = {
  startTime: Timestamp;
};

export function Countdown(props: Props) {
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    let frameId: number;

    const updateTime = () => {
      const currentTime = new Date().getTime();
      const startTimeMs = props.startTime.toMillis();
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
  }, [props.startTime]);

  if (remainingTime > 0) {
    return `Game starting in ${remainingTime}s`;
  } else {
    return "Type!";
  }
}

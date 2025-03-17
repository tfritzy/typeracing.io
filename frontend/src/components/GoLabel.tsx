import { Timestamp } from "@shared/types";
import { useEffect, useState, useRef } from "react";

type GoLabelProps = {
  startTime: Timestamp;
  getNow: () => Timestamp;
};

export const GoLabel = ({ startTime, getNow }: GoLabelProps) => {
  const [shown, setShown] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (showTimerRef.current) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    const now = getNow();

    const timeUntilStartMs =
      (startTime.seconds - now.seconds) * 1000 +
      (startTime.nanoseconds - now.nanoseconds) / 1000000;

    const showDurationMs = 1500;

    if (timeUntilStartMs < -2000) {
      return;
    }

    if (timeUntilStartMs <= 0) {
      setShown(true);

      hideTimerRef.current = window.setTimeout(() => {
        setShown(false);
      }, showDurationMs);
    } else {
      showTimerRef.current = window.setTimeout(() => {
        setShown(true);
      }, timeUntilStartMs);

      hideTimerRef.current = window.setTimeout(() => {
        setShown(false);
      }, timeUntilStartMs + showDurationMs);

      return () => {
        if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
        if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      };
    }
  }, [getNow, startTime.nanoseconds, startTime.seconds]);

  return shown ? (
    <img
      src="/bufo-lets-goo.gif"
      className="w-10 h-10 inline"
      aria-label="Go!"
      style={{
        transform: "scaleX(-1)",
      }}
    />
  ) : null;
};

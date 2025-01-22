import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

type GoLabelProps = {
  startTime: Timestamp;
};

export const GoLabel = (props: GoLabelProps) => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const now = Timestamp.now();
    const delayMs =
      (props.startTime.seconds - now.seconds) * 1000 +
      (props.startTime.nanoseconds - now.nanoseconds) / 1000000;

    if (delayMs < -1500) return;

    const hideTimer = setTimeout(() => setShown(false), delayMs + 1500);
    return () => {
      clearTimeout(hideTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.startTime.seconds]);

  useEffect(() => {
    const now = Timestamp.now();
    const delayMs =
      (props.startTime.seconds - now.seconds) * 1000 +
      (props.startTime.nanoseconds - now.nanoseconds) / 1000000;

    if (delayMs < 0) return;

    const timer = setTimeout(() => setShown(true), delayMs);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.startTime.seconds]);

  return shown ? (
    <img
      src="/bufo-lets-goo.gif"
      className="w-10 h-10 inline transition-opacity"
      aria-label="Go!"
      style={{
        transform: "scaleX(-1)",
        opacity: 1,
      }}
    />
  ) : null;
};

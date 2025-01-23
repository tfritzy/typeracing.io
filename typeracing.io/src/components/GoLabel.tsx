import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

type GoLabelProps = {
  startTime: Timestamp;
};

export const GoLabel = (props: GoLabelProps) => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const start = () => {
      const now = Timestamp.now();
      const delayMs =
        (props.startTime.seconds - now.seconds) * 1000 +
        (props.startTime.nanoseconds - now.nanoseconds) / 1000000;

      if (delayMs < -1501) return;

      const showTimer = setTimeout(() => setShown(true), Math.max(0, delayMs));
      const hideTimer = setTimeout(
        () => setShown(false),
        Math.max(0, delayMs + 1500 + 50)
      );

      return { showTimer, hideTimer };
    };

    const timers = start();
    if (!timers) return;

    return () => {
      clearTimeout(timers.showTimer);
      clearTimeout(timers.hideTimer);
    };
  }, [props.startTime.nanoseconds, props.startTime.seconds]);

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

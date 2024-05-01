import React from "react";

type CountdownProps = {
  endTime: number;
};

export const Countdown = (props: CountdownProps) => {
  const [remaining, setRemaining] = React.useState<number>(0);

  React.useEffect(() => {
    let frameId: number;
    const animate = () => {
      setRemaining((props.endTime - Date.now()) / 1000);

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [props.endTime]);

  return (
    <span className="font-semibold font-mono text-amber-100">
      {remaining.toFixed(1)}
    </span>
  );
};

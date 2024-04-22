import React from "react";

type CountdownProps = {
 endTime: number;
};

export const Countdown = (props: CountdownProps) => {
 const [remaining, setRemaining] =
  React.useState<number>(0);

 React.useEffect(() => {
  let frameId: number;
  const animate = () => {
   setRemaining((Date.now() - props.endTime) / 1000);

   frameId = requestAnimationFrame(animate);
  };

  frameId = requestAnimationFrame(animate);

  return () => {
   cancelAnimationFrame(frameId);
  };
 }, [props.endTime]);

 return (
  <span className="font-semibold font-mono">
   {"T" + remaining.toFixed(1)}
  </span>
 );
};

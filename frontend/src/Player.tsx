import React, { useEffect } from "react";

type PlayerProps = {
  name: string;
  progress: number;
  velocity_km_s: number;
  position_km: number;
};

export const Player = (props: PlayerProps) => {
  const [position, setPosition] = React.useState(props.position_km);

  useEffect(() => {
    let frameId: number;
    let position = props.position_km;
    let lastTime: number = Date.now();

    const animate = () => {
      const deltaTime = Date.now() - lastTime;
      lastTime = Date.now();
      position = position + props.velocity_km_s * deltaTime;
      setPosition(position);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [props.position_km, props.velocity_km_s]);

  useEffect(() => {
    setPosition(props.position_km);
  }, [props.position_km]);

  return (
    <div className="h-md w-screen px-8">
      <div className="text-white text-lg">{props.name}</div>
      <div className="text-gray-300 text-sm">
        {props.velocity_km_s.toLocaleString()} km/s
      </div>
      <div className="text-gray-300 text-sm">
        {position.toLocaleString()} km
      </div>
      <img src="/ship.svg" alt="Ship" className="w-32 h-32 rotate-90" />
    </div>
  );
};

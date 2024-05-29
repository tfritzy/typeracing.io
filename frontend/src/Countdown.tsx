import React from "react";
import { ChillBorder, TextColor } from "./constants";

type CountdownProps = {
  startTime: number;
};

export const Countdown = (props: CountdownProps) => {
  const [timeTillStart, setTimeTillStart] = React.useState<number>(
    (props.startTime - Date.now()) / 1000
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeTillStart((props.startTime - Date.now()) / 1000);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [props.startTime]);

  let string;
  if (timeTillStart > 10) {
    string = "Waiting for opponents";
  } else if (timeTillStart > 0) {
    string = `Starting: 0:${Math.ceil(timeTillStart)
      .toFixed(0)
      .padStart(2, "0")}`;
  } else {
    string = "Go!!!";
  }

  return (
    <div
      className="relative flex flex-col items-center transition-opacity duration-500"
      style={{
        opacity: props.startTime - Date.now() > -250 ? 1 : 0,
      }}
    >
      <div
        className="absolute flex flex-row space-x-2 border-l border-r border-b pt-3 rounded-b-sm p-2 transition-transform duration-500 bg-neutral-color"
        style={{
          borderColor: ChillBorder,
          transform: `translateY(${timeTillStart > 6 ? 0 : 45}px)`,
        }}
      >
        <div
          className={`w-6 h-6 rounded-full transition-colors duration-300 ${
            timeTillStart >= 3 && timeTillStart <= 6
              ? "bg-red-400"
              : "bg-neutral-700"
          }`}
        />
        <div
          className={`w-6 h-6 rounded-full transition-colors duration-300 ${
            timeTillStart > 0 && timeTillStart <= 3
              ? "bg-yellow-400"
              : "bg-neutral-700"
          }`}
        />
        <div
          className={`w-6 h-6 rounded-full transition-colors duration-300 ${
            timeTillStart <= 0 ? "bg-green-400" : "bg-neutral-700"
          }`}
        />
      </div>
      <div
        className="relative font-mono p-1 px-3 text-lg font-bold flex flex-col items-center rounded-sm border overflow-hidden min-w-52 bg-neutral-color"
        style={{
          borderColor: ChillBorder,
        }}
      >
        <div
          className="p-1"
          style={{
            color: TextColor,
          }}
        >
          {string}
        </div>
      </div>
    </div>
  );
};

import React from "react";

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
    string = "Searching for opponents...";
  } else if (timeTillStart > 0) {
    string = `Starting in 0:${Math.ceil(timeTillStart)
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
      <div className="relative font-mono p-1 px-3 text-lg font-bold flex flex-col items-center rounded-sm border overflow-hidden min-w-52 bg-neutral-color border-border-color">
        <div className="p-1 text-text-primary">{string}</div>
      </div>
    </div>
  );
};

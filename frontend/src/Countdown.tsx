import React from "react";
import {
 AccentColor,
 BorderColor,
 NeutralColor,
 TextColor,
} from "./constants";

type CountdownProps = {
 timeTillStart: number;
 countdownDuration: number;
};

export const Countdown = (props: CountdownProps) => {
 let string;
 if (props.timeTillStart > 10) {
  string = "Waiting for opponents";
 } else if (props.timeTillStart > 0.25) {
  string = `starting in: 0:${props.timeTillStart
   .toFixed(0)
   .padStart(2, "0")}`;
 } else {
  string = "Go!!!";
 }

 return (
  <div className="flex flex-col items-center">
   <div
    className="relative font-mono p-1 px-3 text-lg font-bold flex flex-col items-center rounded-full border overflow-hidden"
    style={{
     backgroundColor: NeutralColor,
     borderColor: BorderColor,
    }}
   >
    <div
     className="p-1"
     style={{
      backgroundColor: NeutralColor,
      color: TextColor,
     }}
    >
     {string}
    </div>
   </div>

   <div
    className="flex flex-row space-x-2 border-l border-r border-b pt-2 rounded-b-lg p-2"
    style={{
     backgroundColor: NeutralColor,
     borderColor: BorderColor,
    }}
   >
    <div
     className={`w-6 h-6 rounded-full ${
      props.timeTillStart <= 5
       ? "bg-red-200"
       : "bg-neutral-600"
     }`}
    />
    <div
     className={`w-6 h-6 rounded-full ${
      props.timeTillStart <= 2.5
       ? "bg-yellow-200"
       : "bg-neutral-600"
     }`}
    />
    <div
     className={`w-6 h-6 rounded-full ${
      props.timeTillStart <= 0.25
       ? "bg-accent"
       : "bg-neutral-600"
     }`}
    />
   </div>
  </div>
 );
};

import React from "react";

type PlayerProps = {
 name: string;
 progress: number;
};

export const Player = (props: PlayerProps) => {
 return (
  <div className="h-md w-screen px-8">
   <div className="text-white text-lg">{props.name}</div>
   <div className="text-gray-300 text-sm">
    {Math.floor(
     props.progress * 299_792_458
    ).toLocaleString()}{" "}
    m/s
   </div>
   <img src="/Ship.svg" alt="Ship" className="w-16 h-16" />
  </div>
 );
};

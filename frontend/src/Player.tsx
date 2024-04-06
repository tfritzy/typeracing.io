import React from "react";

type PlayerProps = {
 name: string;
 progress: number;
};

export const Player = (props: PlayerProps) => {
 const numHashes = Math.floor(props.progress * 30);
 const numSpaces = 30 - numHashes;
 const progressString =
  "#".repeat(numHashes) + "_".repeat(numSpaces);
 return (
  <div className="text-white">
   <div>{props.name}</div>
   <div style={{ fontFamily: "monospace" }}>
    [{progressString}]
   </div>
  </div>
 );
};

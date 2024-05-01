import React from "react";
import { PlayerData } from "./App";

export const PlayerResultsList = ({
 players,
}: {
 players: PlayerData[];
}) => {
 return (
  <div>
   {players.map((p, i) => (
    <div>
     <span>{i + 1}.</span>
     <span>{p.name}</span>
    </div>
   ))}
  </div>
 );
};

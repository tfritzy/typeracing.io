import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";

const screenWidthKm = 1_000_000;

type PlayerProps = {
 name: string;
 progress: number;
 velocity_km_s: number;
 position_km: number;
};

const Ship = () => {
 return (
  <img
   src="/ship.svg"
   alt="Ship"
   className="w-16 h-16 rotate-90"
  />
 );
};

const PlayerRow = (player: PlayerProps) => {
 return (
  <div className="h-md w-screen px-8 relative">
   <div className="text-white text-lg">{player.name}</div>
   <div className="text-gray-300 text-sm">
    {player.velocity_km_s.toLocaleString()} km/s
   </div>
   <div className="text-gray-300 text-sm">
    {player.position_km.toLocaleString()} km
   </div>
   <div
    className="absolute"
    style={{
     left: (player.position_km / screenWidthKm) * 100 + "%",
    }}
   >
    <Ship />
   </div>
  </div>
 );
};

export const Players = () => {
 const playerData = useSelector(
  (state: RootState) => state.player
 );
 const players = useSelector(
  (state: RootState) => state.game.players
 );
 const self = players.find(
  (player) => player.id === playerData.id
 );
 const [positionDeltas, setPositionDeltas] = React.useState<
  number[]
 >([]);
 const positionRefs = useRef<number[]>([]);

 useEffect(() => {
  let frameId: number;
  let lastTime: number = Date.now();

  if (!self) {
   return;
  }

  const animate = () => {
   const deltaTime_s = (Date.now() - lastTime) / 1000;
   lastTime = Date.now();

   while (positionRefs.current.length < players.length) {
    positionRefs.current.push(0);
   }

   let ownPos = self.position_km;
   for (let i = 0; i < players.length; i++) {
    positionRefs.current[i] +=
     players[i].velocity_km_s * deltaTime_s;
   }
   const deltas = [];
   for (let i = 0; i < players.length; i++) {
    deltas.push(positionRefs.current[i] - ownPos);
   }
   setPositionDeltas(deltas);

   frameId = requestAnimationFrame(animate);
  };

  frameId = requestAnimationFrame(animate);

  return () => {
   cancelAnimationFrame(frameId);
  };
 }, [players, self]);

 return (
  <div className="flex flex-col space-y-4">
   {players.map((player, index) => (
    <PlayerRow
     key={player.id}
     name={player.name}
     progress={player.progress}
     velocity_km_s={player.velocity_km_s}
     position_km={positionDeltas[index] || 0}
    />
   ))}
  </div>
 );
};

import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { PlayerData } from "./App";
import { StarSolid } from "iconoir-react";
import { AnimatedDots } from "./AnimatedDots";

const placementColors = [
 ["#facc15", "#facc15"],
 ["#d1d5db", "#d1d5db"],
 ["#52525b", "#52525b"],
 ["#52525b", "#52525b"],
 ["#52525b", "#52525b"],
];

const placementText = [
 <span
  style={{ color: placementColors[0][1] }}
  className="font-semibold flex flex-row items-center space-x-1"
 >
  <span>1st</span>
  <StarSolid width={16} height={16} />
 </span>,
 <span
  style={{ color: placementColors[1][1] }}
  className="text-neutral-200 font-semibold"
 >
  2nd
 </span>,
 <span
  style={{ color: placementColors[2][1] }}
  className="text-amber-600 font-semibold"
 >
  3rd
 </span>,
 <span
  style={{ color: placementColors[3][1] }}
  className="text-amber-600 font-semibold"
 >
  4th
 </span>,
];

const PlayerRow = ({ player }: { player?: PlayerData }) => {
 const place = useSelector((state: RootState) =>
  state.game.placements?.findIndex(
   (p) => p.playerId === player?.id
  )
 );

 let playerName;
 if (player?.is_disconnected) {
  playerName = (
   <div className="text-white text-lg">
    <span className="line-through">{player.name}</span>
    <span className="text-sm"> (Disconnected)</span>
   </div>
  );
 } else {
  playerName = (
   <div className="text-white text-lg font-thin">
    {player?.name || (
     <>
      <span>Searching</span>
      <AnimatedDots />
     </>
    )}
   </div>
  );
 }

 return (
  <div className="h-md relative">
   <div className="flex flex-row items-center space-x-2">
    <span>{playerName}</span>
    <span>{place !== -1 ? placementText[place] : ""} </span>
   </div>
   <div
    className="w-full h-1 rounded-full mt-2 relative"
    style={{
     backgroundColor: "#00000033",
    }}
   >
    <div
     className="h-full rounded-full transition-all duration-350 ease-in-out"
     style={{
      width: `${(player?.progress || 0) * 100}%`,
      backgroundColor:
       place !== -1
        ? placementColors[place][0]
        : player?.themeColor,
     }}
    />
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
 const selfIndex = players.findIndex(
  (player) => player.id === playerData.id
 );
 const positionRefs = useRef<number[]>([]);

 useEffect(() => {
  positionRefs.current = [];
  for (let i = 0; i < players.length; i++) {
   positionRefs.current.push(players[i].position_km);
  }
 }, [players]);

 useEffect(() => {
  let frameId: number;
  let lastTime: number = Date.now();

  if (selfIndex === -1) {
   return;
  }

  const animate = () => {
   const deltaTime_s = (Date.now() - lastTime) / 1000;
   lastTime = Date.now();

   while (positionRefs.current.length < players.length) {
    positionRefs.current.push(0);
   }

   for (let i = 0; i < players.length; i++) {
    positionRefs.current[i] +=
     players[i].velocity_km_s * deltaTime_s;
   }
   let ownPos = positionRefs.current[selfIndex];
   const deltas = [];
   for (let i = 0; i < players.length; i++) {
    deltas.push(positionRefs.current[i] - ownPos);
   }

   frameId = requestAnimationFrame(animate);
  };

  frameId = requestAnimationFrame(animate);

  return () => {
   cancelAnimationFrame(frameId);
  };
 }, []);

 return (
  <div className="flex flex-col space-y-4">
   {players.map((player) => (
    <PlayerRow key={player.id} player={player} />
   ))}
   {Array.from({ length: 4 - players.length }).map(
    (_, index) => (
     <PlayerRow key={index} />
    )
   )}
  </div>
 );
};

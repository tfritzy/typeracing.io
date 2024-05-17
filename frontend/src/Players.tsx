import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { PlayerData } from "./App";
import { StarSolid } from "iconoir-react";
import { AnimatedDots } from "./AnimatedDots";
import {
 SecondaryTextColor,
 TertiaryTextColor,
 TextColor,
} from "./constants";

const placementColors = [
 [TextColor, TextColor],
 [SecondaryTextColor, SecondaryTextColor],
 [TertiaryTextColor, TertiaryTextColor],
 [TertiaryTextColor, TertiaryTextColor],
 [TertiaryTextColor, TertiaryTextColor],
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
 const isSelf = useSelector(
  (state: RootState) => state.player.id === player?.id
 );
 const place = useSelector((state: RootState) =>
  state.game.placements?.findIndex(
   (p) => p.playerId === player?.id
  )
 );

 let playerName;
 if (player?.is_disconnected) {
  playerName = (
   <div className="text-white text-lg flex flex-row space-x-1 items-center">
    <span className="line-through">{player.name}</span>
    <span className="text-sm"> (Disconnected)</span>
   </div>
  );
 } else {
  playerName = (
   <div className="text-white text-lg font-thin">
    <span>
     {player?.name || (
      <div>
       Searching
       <span>
        <AnimatedDots />
       </span>
      </div>
     )}
     {isSelf && (
      <span className="text-secondary"> (You)</span>
     )}
    </span>
   </div>
  );
 }

 return (
  <div className="h-md relative">
   <div className="flex flex-row items-center justify-between space-x-2 w-full">
    <div className="flex flex-row space-x-2 items-center">
     <span>{playerName}</span>
     <span>
      {place !== -1 ? placementText[place] : ""}{" "}
     </span>
    </div>
    <div>
     {player?.most_recent_wpm.toFixed(0)}{" "}
     <span style={{ color: SecondaryTextColor }}>WPM</span>
    </div>
   </div>
   <div
    className="w-full h-[2px] mt-2 relative rounded-full"
    style={{
     backgroundColor: "#00000033",
    }}
   >
    <div
     className="h-full rainbow transition-all duration-350 ease-in-out rounded-full"
     style={{
      width: `${(player?.progress || 0) * 100}%`,
     }}
    />
   </div>
  </div>
 );
};

export const Players = () => {
 const player = useSelector(
  (state: RootState) => state.player
 );
 const players = useSelector(
  (state: RootState) => state.game.players
 );
 const selfIndex = players.findIndex(
  (player) => player.id === player.id
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
  <div className="flex flex-col space-y-6">
   {players.map((player) => (
    <PlayerRow key={player.id} player={player} />
   ))}
   {player.gameType !== "Practice" &&
    Array.from({ length: 4 - players.length }).map(
     (_, index) => <PlayerRow key={index} />
    )}
  </div>
 );
};

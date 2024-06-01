import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { HelpCircle, StarSolid } from "iconoir-react";
import { PlayerData } from "./store/gameSlice";
import { Spinner } from "./Spinner";
import Tooltip from "./Tooltip";

const placementText = [
 <span className="font-semibold flex flex-row items-center space-x-1 pulsing-gradient-text">
  <span>1st</span>
  <StarSolid width={16} height={16} />
 </span>,
 <span className="font-semibold text-text-primary">
  2nd
 </span>,
 <span className="font-semibold text-text-secondary">
  3rd
 </span>,
 <span className="font-semibold text-text-tertiary">
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

 const playerName = React.useMemo(() => {
  if (player?.is_disconnected) {
   return (
    <div className="text-lg flex flex-row space-x-2 items-center">
     <span className="text-text-secondary line-through">
      {player.name}
     </span>
     <span className="text-sm"> (Disconnected)</span>
    </div>
   );
  } else {
   return (
    <div className="font-normal">
     <div className="flex flex-row space-x-1 items-center">
      <div>{player?.name || <Spinner />}</div>
      {isSelf && (
       <div className="text-text-tertiary"> (You)</div>
      )}
      {player?.is_bot && (
       <Tooltip content="This player is a bot. Bots are needed before/if ever this game gets a large enough playerbase. Share this game with your friends to help remove them.">
        <div key="gear" className="text-text-tertiary">
         <HelpCircle width={12} height={12} />
        </div>
       </Tooltip>
      )}
     </div>
    </div>
   );
  }
 }, [player, isSelf]);

 return (
  <div className="h-md relative">
   <div className="flex flex-row items-center justify-between space-x-2 w-full mb-2">
    <div className="flex text-text-secondary flex-row space-x-2 items-center">
     <span>{playerName}</span>
     <span>
      {place !== -1 ? placementText[place] : ""}{" "}
     </span>
    </div>
    <div>
     {player?.most_recent_wpm.toFixed(0)}{" "}
     <span className="text-text-secondary">WPM</span>
    </div>
   </div>
   <div className="w-full h-[3px] rounded-full mt-2 relative bg-neutral-color">
    <div
     className="h-full transition-all duration-350 ease-in-out rounded-full"
     style={{
      width: `${(player?.progress || 0) * 100}%`,
      backgroundColor: player?.themeColor,
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
  (p) => p.id === player.id
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

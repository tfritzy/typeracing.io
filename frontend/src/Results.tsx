import { useSelector } from "react-redux";
import { RootState } from "./store/store";

export const Results = () => {
 const game = useSelector((state: RootState) => state.game);

 const finishedPlayers = game.placements.map(
  (placement) => {
   return game.players.find(
    (player) => player.id === placement.playerId
   );
  }
 );

 return (
  <div className="text-white">
   <div>Results</div>
   <div className="flex flex-row space-x-2">
    {finishedPlayers.map((player, index) => (
     <div
      key={index}
      className="border border-white rounded-sm w-32 h-32 flex flex-col items-center justify-center bg-neutral-800 space-y-2"
     >
      <img
       src="/Ship.svg"
       alt="Ship"
       className="w-20 h-20 rotate-45"
      />
      <div className="text-sm">{player?.name}</div>
     </div>
    ))}
   </div>
  </div>
 );
};

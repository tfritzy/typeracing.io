import { useSelector } from "react-redux";
import { RootState } from "./store/store";

const placementColors = [
 ["#facc15", "#facc1533", "#fef3c7"],
 ["#71717a", "#71717a33", "#e5e5e5"],
 ["#854d0e", "#854d0e33", "#fef9c3"],
];

export const Results = () => {
 const game = useSelector((state: RootState) => state.game);

 const finishedPlayers = game.placements.map(
  (placement) => {
   return game.players.find(
    (player) => player.id === placement.playerId
   );
  }
 );

 console.log(finishedPlayers);

 return (
  <div className="text-white">
   <div>Results</div>
   <div className="flex flex-row space-x-2">
    {finishedPlayers.map((player, index) => (
     <div style={{ color: placementColors[index][2] }}>
      <div
       className="relative border w-32 h-32 rounded"
       style={{
        backgroundColor: placementColors[index][1],
        borderColor: placementColors[index][0],
       }}
      >
       <div
        key={index}
        className="opacity-100 flex flex-col items-center justify-center space-y-2"
       >
        <div className="text-sm font-semibold">
         {player?.name}
        </div>

        <table className="text-sm">
         <tr>
          <td className="text-end pr-2">WPM:</td>
          <td className="font-bold">86</td>
         </tr>
         <tr>
          <td className="text-end pr-2">Accuracy:</td>
          <td className="font-bold">97%</td>
         </tr>
         <tr>
          <td className="text-end pr-2">Time:</td>
          <td className="font-bold">1:23</td>
         </tr>
        </table>
       </div>
      </div>
     </div>
    ))}
   </div>
  </div>
 );
};

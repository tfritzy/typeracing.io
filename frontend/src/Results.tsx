import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { LineChart, Series } from "./ResultsChart";
import { useEffect, useMemo, useState } from "react";
import { PlayerData } from "./App";
import { getWpmData } from "./wpmMath";

const placementColors = [
 ["#facc15", "#facc1533", "#fef3c7"],
 ["#71717a", "#71717a33", "#e5e5e5"],
 ["#854d0e", "#854d0e33", "#fef9c3"],
];

export const Results = () => {
 const [wpmData, setWpmData] = useState<Series[]>([]);
 const game = useSelector((state: RootState) => state.game);

 const finishedPlayers = useMemo(
  () =>
   game.placements
    .map((placement) => {
     return game.players.find(
      (player) => player.id === placement.playerId
     );
    })
    .filter((p) => p) as PlayerData[],
  [game.placements]
 );

 useEffect(() => {
  const newWpmData: Series[] = [];
  for (const player of finishedPlayers) {
   const duration =
    player.wordCompletionTimes[
     player.wordCompletionTimes.length - 1
    ];
   const wpmData = getWpmData(
    player.wordCompletionTimes,
    game.end_time > 0 ? game.end_time : duration
   );
   newWpmData.push({
    name: player.name + " wpm",
    data: wpmData,
   });
   setWpmData(newWpmData);
  }
 }, [finishedPlayers]);

 const netWpm =
  (game.words.length /
   finishedPlayers[0].wordCompletionTimes[
    finishedPlayers[0].wordCompletionTimes.length - 1
   ]) *
  60;

 return (
  <div className="text-white">
   <div>Results</div>

   <LineChart series={wpmData} />
   {netWpm + " WPM"}

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

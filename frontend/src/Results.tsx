import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { LineChart, Series } from "./ResultsChart";
import { useEffect, useMemo, useState } from "react";
import { PlayerData } from "./App";

const placementColors = [
 ["#facc15", "#facc1533", "#fef3c7"],
 ["#71717a", "#71717a33", "#e5e5e5"],
 ["#854d0e", "#854d0e33", "#fef9c3"],
];

const getWpmDataByPeriod = (
 data: number[],
 period_duration: number,
 full_duration: number
) => {
 const framesPerSecond = 1 / period_duration;

 const wordsFinishedInQuarterSecondFrames = Array.from(
  { length: Math.ceil(full_duration * framesPerSecond) },
  () => 0
 );
 for (const time of data) {
  const frame = Math.floor(time * framesPerSecond);
  wordsFinishedInQuarterSecondFrames[frame] += 1;
 }
 return wordsFinishedInQuarterSecondFrames;
};

const getRollingAverages = (
 data: number[],
 windowSize: number
) => {
 const rollingAverages = [];
 const buffer = [];
 for (let i = 0; i < data.length; i++) {
  buffer.push(data[i]);
  if (buffer.length > windowSize) {
   buffer.shift();
  }
  const rollingAverage =
   buffer.reduce((acc, val) => acc + val) / buffer.length;
  rollingAverages.push(rollingAverage);
 }
 return rollingAverages;
};

const getWpmData = (
 wordFinishTimes: number[],
 duration: number
) => {
 console.log("wordFinishTimes", wordFinishTimes);
 const numPeriodsPerSecond = 8;
 const periodDuration = 1 / numPeriodsPerSecond;
 const wordsFinishedPerEithSecond = getWpmDataByPeriod(
  wordFinishTimes,
  periodDuration,
  duration
 );

 const halfSecondWpms = getRollingAverages(
  wordsFinishedPerEithSecond,
  1
 );

 console.log("halfSecondWpms", halfSecondWpms);

 const avgWpmOfSeconds = Array.from(
  { length: Math.ceil(duration) },
  () => 0
 );
 for (let i = 0; i < avgWpmOfSeconds.length; i++) {
  const wordsFinishedInSecond = halfSecondWpms.slice(
   i * numPeriodsPerSecond,
   i * numPeriodsPerSecond + numPeriodsPerSecond
  );
  avgWpmOfSeconds[i] =
   wordsFinishedInSecond.reduce((acc, val) => acc + val) /
   numPeriodsPerSecond;
 }

 return avgWpmOfSeconds;
};

export const Results = () => {
 const [wpmData, setWpmData] = useState<Series[]>([]);
 const game = useSelector((state: RootState) => state.game);
 const self = useSelector((state: RootState) =>
  state.game.players.find(
   (player) => player.id === state.player.id
  )
 );
 console.log(game);

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
   console.log("duration", duration);
   const wpmData = getWpmData(
    player.wordCompletionTimes,
    game.end_time > 0 ? game.end_time : duration
   );
   newWpmData.push({
    name: player.name,
    data: wpmData,
   });
   setWpmData(newWpmData);
  }
 }, [finishedPlayers]);

 console.log(wpmData);

 return (
  <div className="text-white">
   <div>Results</div>

   <LineChart series={wpmData} />

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

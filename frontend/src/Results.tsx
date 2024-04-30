import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { LineChart, Series } from "./ResultsChart";
import { useEffect, useMemo, useState } from "react";
import { PlayerData } from "./App";
import { ActionBar } from "./ActionBar";
import { HomeBreadcrumb } from "./HomeBreadcrumb";

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
   if (
    !player.wpm_by_second?.length ||
    !player.raw_wpm_by_second?.length
   ) {
    continue;
   }

   newWpmData.push({
    name: "raw wpm",
    data: player.raw_wpm_by_second,
   });

   newWpmData.push({
    name: "wpm",
    data: player.wpm_by_second,
   });

   setWpmData(newWpmData);
  }
 }, [finishedPlayers]);

 return (
  <LineChart
   series={wpmData}
   playerColor={finishedPlayers[0].themeColor}
  />
 );
};

import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { LineChart, Series } from "./ResultsChart";
import { useEffect, useMemo, useState } from "react";
import { PlayerData } from "./App";
import { ActionBar } from "./ActionBar";
import { HomeBreadcrumb } from "./HomeBreadcrumb";
import { VeryChillBorder } from "./constants";

export const Results = () => {
 const [wpmData, setWpmData] = useState<Series[]>([]);
 const game = useSelector((state: RootState) => state.game);
 const selfId = useSelector(
  (state: RootState) => state.player.id
 );

 const finishedPlayers = useMemo(
  () =>
   game.placements
    .map((placement) => {
     return game.players.find(
      (player) => player.id === placement.playerId
     );
    })
    .filter((p) => p) as PlayerData[],
  [game.placements, game.players]
 );

 const self = finishedPlayers.find((p) => p.id === selfId);

 useEffect(() => {
  const newWpmData: Series[] = [];
  if (
   !self ||
   !self.wpm_by_second?.length ||
   !self.raw_wpm_by_second?.length
  ) {
   return;
  }

  newWpmData.push({
   name: "raw",
   data: self.raw_wpm_by_second,
  });

  newWpmData.push({
   name: "wpm",
   data: self.wpm_by_second,
  });

  setWpmData(newWpmData);
 }, [self]);

 if (!finishedPlayers.length) {
  return null;
 }

 const wordsTyped = game.phrase.split(" ").length;
 const charactersTyped = game.phrase.length;
 const duration =
  finishedPlayers[0].wpm_by_second?.length || 0;
 const durationFormatted = new Date(duration * 1000)
  .toISOString()
  .substr(15, 4);
 const finalWpm = self?.final_wpm || 0;
 console.log("Accuracy: ", self?.accuracy);

 return (
  <div>
   <div className="flex flex-row">
    <div className="p-3 px-6">
     <div className="text-sm text-secondary">Final wpm</div>
     <div className="text-5xl text-accent">
      {finalWpm.toFixed(0)}
     </div>
    </div>

    <div className="p-3 px-6">
     <div className="text-sm text-secondary">Accuracy</div>
     <div className="text-5xl text-accent">
      {(self?.accuracy || 0) * 100}%
     </div>
    </div>

    <div className="p-3 px-6">
     <div className="text-sm text-secondary">Duration</div>
     <div className="text-5xl text-accent">
      {durationFormatted}
     </div>
    </div>
   </div>

   <LineChart series={wpmData} />
  </div>
 );
};

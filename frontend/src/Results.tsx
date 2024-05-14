import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { LineChart, Series } from "./ResultsChart";
import { useEffect, useMemo, useState } from "react";
import { PlayerData } from "./App";
import { ActionBar } from "./ActionBar";
import { HomeBreadcrumb } from "./HomeBreadcrumb";

export const Results = () => {
  const [wpmData, setWpmData] = useState<Series[]>([]);
  const game = useSelector((state: RootState) => state.game);
  const selfId = useSelector((state: RootState) => state.player.id);

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
  const duration = finishedPlayers[0].wpm_by_second?.length || 0;

  return (
    <div>
      <LineChart series={wpmData} />
    </div>
  );
};

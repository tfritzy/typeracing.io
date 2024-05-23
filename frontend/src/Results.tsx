import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { LineChart, Series } from "./ResultsChart";
import { useEffect, useMemo, useState } from "react";
import { PlayerData } from "./store/gameSlice";
import { ErrorsAtTime } from "./compiled";

export const Results = () => {
  const [wpmData, setWpmData] = useState<{
    series: Series[];
    errors: ErrorsAtTime[];
  } | null>(null);
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

    setWpmData({ series: newWpmData, errors: self.errors_at_time || [] });
  }, [self]);

  if (!finishedPlayers.length) {
    return null;
  }

  const numWords = game.phrase.split(" ").length;
  const duration = finishedPlayers[0].wpm_by_second?.length || 0;
  const durationFormatted = new Date(duration * 1000)
    .toISOString()
    .substr(15, 4);
  const finalWpm = self?.final_wpm || 0;

  return (
    <div>
      <div className="flex flex-row">
        <div className="p-3 px-6">
          <div className="text-sm text-tertiary">Final wpm</div>
          <div
            className={`text-4xl ${
              finalWpm >= 100 ? "gradient-text" : "text-primary"
            }`}
          >
            {finalWpm.toFixed(0)}
          </div>
        </div>

        <div className="p-3 px-6">
          <div className="text-sm text-tertiary">Accuracy</div>
          <div
            className={`text-4xl ${
              self?.accuracy === 1 ? "gradient-text" : "text-primary"
            }`}
          >
            {((self?.accuracy || 0) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <LineChart
        series={wpmData?.series || []}
        errors={wpmData?.errors || []}
      />

      <div className="flex flex-row">
        <div className="p-3 px-6">
          <div className="text-sm text-tertiary">Time</div>
          <div className="text-xl text-secondary">{durationFormatted}</div>
        </div>

        <div className="p-3 px-6">
          <div className="text-sm text-tertiary">Words</div>
          <div className="text-xl text-secondary">{numWords}</div>
        </div>

        <div className="p-3 px-6">
          <div className="text-sm text-tertiary">Errors</div>
          <div className="text-xl text-secondary">{numWords}</div>
        </div>

        <div className="p-3 px-6">
          <div className="text-sm text-tertiary">Characters</div>
          <div className="text-xl text-secondary">{numWords}</div>
        </div>

        <div className="p-3 px-6">
          <div className="text-sm text-tertiary">Characters/m</div>
          <div className="text-xl text-secondary">{numWords}</div>
        </div>
      </div>
    </div>
  );
};

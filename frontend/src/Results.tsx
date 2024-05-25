import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { LineChart, Series } from "./ResultsChart";
import { useEffect, useMemo, useState } from "react";
import { PlayerData } from "./store/gameSlice";
import { ErrorsAtTime } from "./compiled";
import {
  BorderColor,
  ChillBorder,
  NeutralColor,
  TertiaryTextColor,
  VeryChillBorder,
} from "./constants";

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

  const getClassForWpm = (wpm: number) => {
    if (wpm >= 100) {
      return " pulsing-gradient-text  ";
    } else if (wpm >= 80) {
      return "accent-gradient-text";
    } else if (wpm >= 60) {
      return "text-neutral-300";
    } else {
      return "text-secondary";
    }
  };

  const getClassForAccuracy = (accuracy: number) => {
    if (accuracy >= 1) {
      return " pulsing-gradient-text ";
    } else if (accuracy >= 0.97) {
      return "accent-gradient-text";
    } else if (accuracy >= 0.95) {
      return "text-neutral-300";
    } else {
      return "text-secondary";
    }
  };

  if (!finishedPlayers.length) {
    return null;
  }

  const numWords = game.phrase.split(" ").length;
  const numErrors = self?.num_errors || 0;
  const numCharacters = game.phrase.length;
  const duration = finishedPlayers[0].wpm_by_second?.length || 0;
  const durationFormatted = new Date(duration * 1000)
    .toISOString()
    .substr(15, 4);
  const finalWpm = self?.final_wpm || 0;

  return (
    <div>
      <div className="flex flex-row space-x-4">
        <div
          className={`p-3 py-2 min-w-24 rounded-lg ${getClassForWpm(finalWpm)}`}
        >
          <div className="text-sm text-tertiary">WPM</div>
          <div
            className={`text-3xl border-none font-mono mx-auto ${getClassForWpm(
              finalWpm
            )}`}
          >
            {finalWpm.toFixed(1)}
          </div>
        </div>

        <div
          className={`p-3 py-2 min-w-24 rounded-lg ${getClassForAccuracy(
            self?.accuracy || 0
          )}`}
        >
          <div className="text-sm text-tertiary">Accuracy</div>
          <div className={"text-3xl border-none font-mono"}>
            {((self?.accuracy || 0) * 100).toFixed(0)}%
          </div>
        </div>

        <div
          className="h-12 w-1 border-r my-auto"
          style={{ borderColor: VeryChillBorder }}
        />

        <div className="p-3 px-6 h-full">
          <div className="text-sm text-tertiary">Time</div>
          <div className="text-xl font-mono text-primary">
            {durationFormatted}
          </div>
        </div>

        <div className="p-3 px-6">
          <div className="text-sm text-tertiary">Words</div>
          <div className="text-xl font-mono text-primary">{numWords}</div>
        </div>

        <div className="p-3 px-6">
          <div className="text-sm text-tertiary">Mistakes</div>
          <div className="text-xl font-mono text-primary">{numErrors}</div>
        </div>

        <div className="p-3 px-6">
          <div className="text-sm text-tertiary">Characters</div>
          <div className="text-xl font-mono text-primary">{numCharacters}</div>
        </div>

        <div className="p-3 px-6">
          <div className="text-sm text-tertiary">Characters/s</div>
          <div className="text-xl font-mono text-primary">
            {(numCharacters / duration).toFixed(1)}
          </div>
        </div>
      </div>

      <LineChart
        series={wpmData?.series || []}
        errors={wpmData?.errors || []}
      />
    </div>
  );
};

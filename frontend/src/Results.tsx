import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { LineChart, Series } from "./ResultsChart";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlayerData } from "./store/gameSlice";
import { ErrorsAtTime } from "./compiled";
import React from "react";

export const Results = () => {
  const [wpmData, setWpmData] = useState<{
    series: Series[];
    errors: ErrorsAtTime[];
  } | null>(null);
  const players = useSelector((state: RootState) => state.game.players);
  const placements = useSelector((state: RootState) => state.game.placements);
  const phrase = useSelector((state: RootState) => state.game.phrase);
  const selfId = useSelector((state: RootState) => state.player.id);

  const finishedPlayers = useMemo(
    () =>
      placements
        .map((placement) => {
          return players.find((player) => player.id === placement.playerId);
        })
        .filter((p) => p) as PlayerData[],
    [placements, players]
  );

  const self = finishedPlayers.find((p) => p.id === selfId);
  const placement = finishedPlayers.findIndex((p) => p.id === selfId);

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

    setWpmData({
      series: newWpmData,
      errors: self.errors_at_time || [],
    });
  }, [self]);

  const getClassForWpm = useCallback((wpm: number) => {
    if (wpm >= 100) {
      return " pulsing-gradient-text  ";
    } else if (wpm >= 80) {
      return "accent-gradient-text";
    } else if (wpm >= 60) {
      return "text-neutral-300";
    } else {
      return "text-text-secondary";
    }
  }, []);

  const getClassForAccuracy = useCallback((accuracy: number) => {
    if (accuracy >= 1) {
      return " pulsing-gradient-text ";
    } else if (accuracy >= 0.97) {
      return "accent-gradient-text";
    } else if (accuracy >= 0.95) {
      return "text-neutral-300";
    } else {
      return "text-text-secondary";
    }
  }, []);

  const getStringForPlacement = useCallback((place: number) => {
    if (place === 0) {
      return (
        <span>
          1<sup className="text-md">st</sup>
        </span>
      );
    } else if (place === 1) {
      return (
        <span>
          2<sup className="text-md">nd</sup>
        </span>
      );
    } else if (place === 2) {
      return (
        <span>
          3<sup className="text-md">rd</sup>
        </span>
      );
    } else {
      return (
        <span>
          4<sup className="text-md">th</sup>
        </span>
      );
    }
  }, []);

  const getClassForPlacement = useCallback((placement: number) => {
    if (placement === 0) {
      return " pulsing-gradient-text ";
    } else if (placement === 1) {
      return "accent-gradient-text";
    } else if (placement === 2) {
      return "text-neutral-300";
    } else {
      return "text-text-secondary";
    }
  }, []);

  const chart = React.useMemo(() => {
    return wpmData ? (
      <LineChart series={wpmData.series} errors={wpmData.errors} />
    ) : null;
  }, [wpmData]);

  if (!finishedPlayers.length) {
    return null;
  }

  const numWords = phrase.split(" ").length;
  const numErrors = self?.num_errors || 0;
  const numCharacters = phrase.length;
  const duration = finishedPlayers[0].wpm_by_second?.length || 0;
  const durationFormatted = new Date(duration * 1000)
    .toISOString()
    .substr(15, 4);
  const finalWpm = self?.final_wpm || 0;

  return (
    <div>
      <div className="flex flex-row space-x-4 overflow-x-auto">
        <div
          className={`p-3 py-2 min-w-24 rounded-lg ${getClassForPlacement(
            placement
          )}`}
        >
          <div className="text-xs text-text-tertiary">PLACE</div>
          <div
            className={`text-3xl border-none font-mono mx-auto ${getClassForPlacement(
              placement
            )}`}
          >
            {getStringForPlacement(placement)}
          </div>
        </div>

        <div
          className={`p-3 py-2 min-w-24 rounded-lg ${getClassForWpm(finalWpm)}`}
        >
          <div className="text-xs text-text-tertiary">WPM</div>
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
          <div className="text-xs text-text-tertiary">ACCURACY</div>
          <div className={"text-3xl border-none font-mono"}>
            {((self?.accuracy || 0) * 100).toFixed(0)}%
          </div>
        </div>

        <div className="h-12 w-1 border-r my-auto border-border-color" />

        <div className="p-3 px-6 h-full">
          <div className="text-xs text-text-tertiary">TIME</div>
          <div className="text-xl font-mono text-primary">
            {durationFormatted}
          </div>
        </div>

        <div className="p-3 px-6">
          <div className="text-xs text-text-tertiary">WORDS</div>
          <div className="text-xl font-mono text-primary">{numWords}</div>
        </div>

        <div className="p-3 px-6">
          <div className="text-xs text-text-tertiary">MISTAKES</div>
          <div className="text-xl font-mono text-primary">{numErrors}</div>
        </div>

        <div className="p-3 px-6">
          <div className="text-xs text-text-tertiary">CHARACTERS</div>
          <div className="text-xl font-mono text-primary">{numCharacters}</div>
        </div>

        <div className="p-3 px-6">
          <div className="text-xs text-text-tertiary">CHARACTERS/S</div>
          <div className="text-xl font-mono text-primary">
            {(numCharacters / duration).toFixed(1)}
          </div>
        </div>
      </div>

      {chart}
    </div>
  );
};

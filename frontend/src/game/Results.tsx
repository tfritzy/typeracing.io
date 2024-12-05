import { RootState } from "../store/store";
import { WpmOverTime } from "../charts/WpmOverTimeChart";
import { useCallback, useMemo } from "react";
import { PlayerData } from "../store/gameSlice";
import ConfettiExplosion from "react-confetti-explosion";
import { useAppSelector, useGameSelector } from "../store/storeHooks";
import { GameStoreState } from "../store/gameStore";
import { StarSolid } from "iconoir-react";

export const Results = () => {
  const players = useGameSelector(
    (state: GameStoreState) => state.game.players
  );
  const placements = useGameSelector(
    (state: GameStoreState) => state.game.placements
  );
  const phrase = useGameSelector((state: GameStoreState) => state.game.phrase);
  const selfId = useAppSelector((state: RootState) => state.player.id);

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

  const getClassForWpm = useCallback((wpm: number) => {
    if (wpm >= 100) {
      return "text-accent-secondary";
    } else if (wpm >= 80) {
      return "text-accent";
    } else if (wpm >= 60) {
      return "text-base-300";
    } else {
      return "text-base-200";
    }
  }, []);

  const getClassForAccuracy = useCallback((accuracy: number) => {
    if (accuracy >= 1) {
      return "text-accent-secondary";
    } else if (accuracy >= 0.97) {
      return "text-accent";
    } else if (accuracy >= 0.95) {
      return "text-base-300";
    } else {
      return "text-base-200";
    }
  }, []);

  const getStringForPlacement = useCallback((place: number) => {
    if (place === 0) {
      return (
        <span>
          <StarSolid className="h-8 w-8" />
        </span>
      );
    } else if (place === 1) {
      return (
        <span>
          <span>2</span>
          <span className="text-sm align-super">nd</span>
        </span>
      );
    } else if (place === 2) {
      return (
        <span>
          <span>3</span>
          <span className="text-sm align-super">rd</span>
        </span>
      );
    } else {
      return (
        <span>
          <span>4</span>
          <span className="text-sm align-super">th</span>
        </span>
      );
    }
  }, []);

  const getClassForPlacement = useCallback((placement: number) => {
    if (placement === 0) {
      return "text-accent-secondary";
    } else if (placement === 1) {
      return "text-accent";
    } else if (placement === 2) {
      return "text-base-300";
    } else {
      return "text-base-200";
    }
  }, []);

  const chart = useMemo(() => {
    if (
      !self?.wpm_by_second ||
      !self?.raw_wpm_by_second ||
      !self?.errors_at_time
    ) {
      return null;
    }

    return (
      <WpmOverTime
        wpm_by_second={self.wpm_by_second}
        raw_wpm_by_second={self.raw_wpm_by_second}
        errors={self.errors_at_time}
      />
    );
  }, [self?.errors_at_time, self?.raw_wpm_by_second, self?.wpm_by_second]);

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
          {placement === 0 && (
            <ConfettiExplosion
              particleSize={2}
              force={0.2}
              duration={4000}
              colors={["#fed7aa", "#fde68a", "#bae6fd", "#c7d2fe", "#f5d0fe"]}
            />
          )}
          <div className="text-xs">PLACE</div>
          <div
            className={`text-3xl border-none font-mono mx-auto flex flex-row space-x-1 items-center ${getClassForPlacement(
              placement
            )}`}
          >
            <div>{getStringForPlacement(placement)}</div>
          </div>
        </div>

        <div
          className={`p-3 py-2 min-w-24 rounded-lg ${getClassForWpm(finalWpm)}`}
        >
          <div className="text-xs">WPM</div>
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
          <div className="text-xs">ACCURACY</div>
          <div className={"text-3xl border-none font-mono"}>
            {((self?.accuracy || 0) * 100).toFixed(0)}%
          </div>
        </div>

        <div className="h-12 w-1 border-r my-auto border-base-600" />

        <div className="p-3 px-6 h-full">
          <div className="text-xs text-base-300">TIME</div>
          <div className="text-xl font-mono base-100">{durationFormatted}</div>
        </div>

        <div className="p-3 px-6">
          <div className="text-xs text-base-300">WORDS</div>
          <div className="text-xl font-mono base-100">{numWords}</div>
        </div>

        <div className="p-3 px-6">
          <div className="text-xs text-base-300">MISTAKES</div>
          <div className="text-xl font-mono base-100">{numErrors}</div>
        </div>

        <div className="p-3 px-6">
          <div className="text-xs text-base-300">CHARACTERS</div>
          <div className="text-xl font-mono base-100">{numCharacters}</div>
        </div>
      </div>

      {chart}
    </div>
  );
};

import React, { useEffect, useMemo } from "react";
import { GameResult, ModeType } from "@shared/types";
import { allModes, flatAllModes } from "../modes";

type ModeSelectorProps = {
  gameResults: Map<string, GameResult[]>;
  onModeChange: (mode: ModeType) => void;
  selectedMode: ModeType | undefined;
};

export function ModeSelector({
  gameResults,
  onModeChange,
  selectedMode,
}: ModeSelectorProps) {
  const allModeTypes = useMemo(() => {
    return Object.values(allModes)
      .flatMap((group) => group)
      .map((mode) => mode.type);
  }, []);

  const modePlayCounts = useMemo(() => {
    const counts: Record<ModeType, number> = {} as Record<ModeType, number>;

    allModeTypes.forEach((mode) => {
      counts[mode] = 0;
    });

    for (const [_, dayResults] of gameResults) {
      dayResults.forEach((result) => {
        counts[result.mode] = (counts[result.mode] || 0) + 1;
      });
    }

    return counts;
  }, [allModeTypes, gameResults]);

  const mostPlayedMode = useMemo(() => {
    return (Object.entries(modePlayCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || "english") as ModeType;
  }, [modePlayCounts]);

  useEffect(() => {
    onModeChange(mostPlayedMode);
  }, [mostPlayedMode, onModeChange]);

  const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = event.target.value as ModeType;
    onModeChange(newMode);
    onModeChange(newMode);
  };

  return (
    <div className="relative inline-block w-full max-w-[300px] h-min">
      <div className="text-base-400 absolute right-3 top-1/2 -translate-y-1/2">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
      <select
        value={selectedMode}
        onChange={handleModeChange}
        className="w-full appearance-none bg-base-800 border border-base-700 text-base-400 py-2 px-3 rounded focus:outline-none flex flex-row justify-between"
      >
        {allModeTypes
          .map((mode) => {
            const modeInfo = flatAllModes[mode];

            if (modePlayCounts[mode] === 0) {
              return null;
            }

            return (
              <option key={mode} value={mode} className="bg-base-800">
                {modeInfo.name} ({modePlayCounts[mode]}
                {modePlayCounts[mode] === 1 ? " game" : " games"})
              </option>
            );
          })
          .filter((o) => o)}
      </select>
    </div>
  );
}

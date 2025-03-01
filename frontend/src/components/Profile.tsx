import { useEffect, useMemo, useState } from "react";
import { doc, Firestore, onSnapshot } from "firebase/firestore";
import { Auth, User } from "firebase/auth";
import { GameResult, ModeType, MonthlyResults } from "@shared/types";
import { GithubActivityChart } from "./GithubActivityChart";
import { GameHistoryChart } from "./GameHistoryChart";
import EditableName from "./EditableName";
import { AuthLine } from "./SignIn";
import { AccountManagement } from "./AccountManagement";
import { Spinner } from "./Spinner";
import { ModeSelector } from "./ModeSelect";
import React from "react";

export const Profile = ({
  db,
  user,
  auth,
}: {
  db: Firestore;
  user: User | null;
  auth: Auth;
}) => {
  const [yearlyResults, setYearlyResults] = useState<(MonthlyResults | null)[]>(
    new Array(12).fill(null)
  );
  const [selectedYear] = useState<number>(2025);
  const [selectedMode, setSelectedMode] = useState<ModeType | undefined>();

  const chooseMode = React.useCallback(
    (mode: ModeType) => setSelectedMode(mode),
    [setSelectedMode]
  );

  const monthlyResultsRefs = useMemo(() => {
    if (!user) return [];
    return Array.from({ length: 12 }, (_, i) =>
      doc(db, "monthlyResults", `${user.uid}_${selectedYear}_${i}`)
    );
  }, [user, db, selectedYear]);

  useEffect(() => {
    const unsubscribes = monthlyResultsRefs.map((ref, index) =>
      onSnapshot(ref, (doc) => {
        setYearlyResults((prev) => {
          const newResults = [...prev];
          newResults[index] = doc.exists()
            ? (doc.data() as MonthlyResults)
            : null;
          return newResults;
        });
      })
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [db, monthlyResultsRefs]);

  const [
    allData,
    filteredData,
    totalGames,
    gamesPlayed,
    wins,
    avgWpm,
    bestWpm,
  ] = useMemo(() => {
    const allData: Map<string, GameResult[]> = new Map();
    const filteredData: Map<string, GameResult[]> = new Map();
    let played = 0;
    let totalWpm = 0;
    let bestWpm = 0;
    let gamesPlayed = 0;
    let wins = 0;

    for (let month = 0; month < 12; month++) {
      const monthData = yearlyResults[month];
      if (!monthData) continue;

      for (const [dayIndex, data] of Object.entries(monthData.results)) {
        const filtered = data.filter((d) => d.mode === selectedMode);
        const day = new Date(selectedYear, month, parseInt(dayIndex));
        played += filtered.length;
        filtered.forEach((d) => {
          if (d.mode != selectedMode) return;

          totalWpm += d.wpm;
          bestWpm = Math.max(bestWpm, d.wpm);
          gamesPlayed += 1;
          if (d.place === 0) wins += 1;
        });
        allData.set(day.toISOString(), data);
        filteredData.set(day.toISOString(), filtered);
      }
    }

    return [
      allData,
      filteredData,
      played,
      gamesPlayed,
      wins,
      totalWpm / (played || 1),
      bestWpm,
    ];
  }, [selectedMode, selectedYear, yearlyResults]);

  if (!user) {
    return <Spinner />;
  }

  if (yearlyResults === null) {
    return <div>Error loading stats</div>;
  }

  return (
    <div className="w-full flex flex-col overflow-y-auto pb-6 pt-12 h-full">
      <div className="mb-2">
        <div className="mb-2">
          <EditableName />
        </div>
        <AuthLine auth={auth} user={user} />
      </div>
      <div className="flex flex-row justify-between mt-4">
        <div className="flex flex-row space-x-3">
          <Box title="Played">{gamesPlayed}</Box>
          <Box title="Wins">{wins}</Box>
          <Box title="Best WPM">{bestWpm > 0 ? bestWpm.toFixed(0) : "n/a"}</Box>
        </div>
        <ModeSelector
          gameResults={allData}
          onModeChange={chooseMode}
          selectedMode={selectedMode}
        />
      </div>

      <div>
        <div className="text-base-400 bg-base-800 translate-y-[10px] translate-x-4 px-2 w-max">
          Played <b>{totalGames} games</b> in the past year
        </div>
        <div className="border border-base-700 p-4 pt-8 pr-8 w-full rounded">
          <GithubActivityChart data={filteredData} year={selectedYear} />
        </div>

        <div>
          <div className="text-base-400 bg-base-800 translate-y-[10px] translate-x-4 px-2 w-max">
            With an average of <b>{avgWpm.toFixed(0)} wpm</b>
          </div>
          <div className="border border-base-700 p-4 pt-8 pr-8 w-full rounded">
            <GameHistoryChart data={filteredData} year={selectedYear} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <AccountManagement auth={auth} user={user} />
      </div>
    </div>
  );
};

export function Box({
  children,
  title,
}: {
  children: JSX.Element | string | number | undefined;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-0">
        <div className="bg-base-800 -translate-y-[11px] px-2 w-max text-sm text-base-400">
          {title}
        </div>
      </div>
      <div className="border border-base-700 w-24 py-4 text-center text-base-400 rounded">
        <div className="text-3xl">{children}</div>
      </div>
    </div>
  );
}

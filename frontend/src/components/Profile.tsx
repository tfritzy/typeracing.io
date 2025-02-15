import { useEffect, useMemo, useState } from "react";
import { doc, Firestore, onSnapshot, Timestamp } from "firebase/firestore";
import { Auth, User } from "firebase/auth";
import { GameResult, MonthlyResults, PlayerStats } from "@shared/types";
import { GithubActivityChart } from "./GithubActivityChart";
import { GameHistoryChart } from "./GameHistoryChart";
import EditableName from "./EditableName";
import { AuthLine } from "./SignIn";
import { AccountManagement } from "./AccountManagement";

const emptyPlayerStats: PlayerStats = {
  wins: 0,
  gamesPlayed: 0,
  lastUpdated: Timestamp.now(),
  modeStats: {},
};

export const Profile = ({
  db,
  user,
  auth,
}: {
  db: Firestore;
  user: User;
  auth: Auth;
}) => {
  const [playerStats, setPlayerStats] = useState<PlayerStats>(emptyPlayerStats);
  const [yearlyResults, setYearlyResults] = useState<(MonthlyResults | null)[]>(
    new Array(12).fill(null)
  );
  const [selectedYear] = useState<number>(2025);

  const statsDocRef = useMemo(() => {
    return doc(db, "playerStats", user.uid);
  }, [db, user.uid]);

  useEffect(() => {
    if (!statsDocRef) return;
    const unsubscribe = onSnapshot(statsDocRef, (doc) => {
      if (doc.exists()) {
        setPlayerStats(doc.data() as PlayerStats);
      } else {
        setPlayerStats(emptyPlayerStats);
      }
    });
    return () => unsubscribe();
  }, [db, statsDocRef]);

  const monthlyResultsRefs = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) =>
      doc(db, "monthlyResults", `${user.uid}_${selectedYear}_${i}`)
    );
  }, [db, user.uid, selectedYear]);

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

  const [allData, totalGames, avgWpm] = useMemo(() => {
    const allData: Map<string, GameResult[]> = new Map();
    let played = 0;
    let totalWpm = 0;

    for (let month = 0; month < 12; month++) {
      const monthData = yearlyResults[month];
      if (!monthData) continue;

      for (const [dayIndex, data] of Object.entries(monthData.results)) {
        const day = new Date(selectedYear, month, parseInt(dayIndex));
        played += data.length;
        data.forEach((d) => (totalWpm += d.wpm));
        allData.set(day.toISOString(), data);
      }
    }

    return [allData, played, totalWpm / (played || 1)];
  }, [selectedYear, yearlyResults]);

  if (yearlyResults === null) {
    return <div>Error loading stats</div>;
  }

  return (
    <div className="w-full flex flex-col overflow-y-auto pb-6">
      <div className="mb-2">
        <div className="mb-2">
          <EditableName />
        </div>
        <AuthLine auth={auth} user={user} />
      </div>
      <div className="flex flex-row space-x-3">
        <Box title="Played">{playerStats.gamesPlayed}</Box>
        <Box title="Wins">{playerStats.wins}</Box>
        {playerStats && (
          <Box title="Win rate">
            {playerStats.gamesPlayed > 0
              ? ((playerStats.wins / playerStats.gamesPlayed) * 100).toFixed(
                  0
                ) + "%"
              : "n/a"}
          </Box>
        )}
      </div>

      <div>
        <div className="text-base-400 bg-base-800 translate-y-[10px] translate-x-4 px-2 w-max">
          Played <b>{totalGames} games</b> in the past year
        </div>
        <div className="border border-base-700 p-4 pt-8 pr-8 w-min">
          <GithubActivityChart data={allData} year={selectedYear} />
        </div>

        <div>
          <div className="text-base-400 bg-base-800 translate-y-[10px] translate-x-4 px-2 w-max">
            With an average of <b>{avgWpm.toFixed(0)} wpm</b>
          </div>
          <div className="border border-base-700 p-4 pt-8 pr-8 w-min">
            <GameHistoryChart data={allData} year={selectedYear} />
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
      <div className="bg-base-800 translate-y-[9px] px-1 w-max text-sm text-base-400">
        {title}
      </div>
      <div className="border border-base-700 w-24 py-4 text-center text-base-400">
        <div className="text-3xl">{children}</div>
      </div>
    </div>
  );
}

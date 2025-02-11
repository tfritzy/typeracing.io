import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { generateRandomName } from "../helpers/generateRandomName";
import { Pencil } from "../icons/pencil";
import { doc, Firestore, onSnapshot, Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { MonthlyResults, PlayerStats } from "@shared/types";
import { GithubActivityChart } from "./GithubActivityChart";
import { GameHistoryChart } from "./GameHistoryChart";

const emptyPlayerStats: PlayerStats = {
  wins: 0,
  gamesPlayed: 0,
  lastUpdated: Timestamp.now(),
  modeStats: {},
};

export const Profile = ({ db, user }: { db: Firestore; user: User }) => {
  const [name, setName] = useState<string>("");
  const [playerStats, setPlayerStats] = useState<PlayerStats>(emptyPlayerStats);
  const [yearlyResults, setYearlyResults] = useState<(MonthlyResults | null)[]>(
    new Array(12).fill(null)
  );
  const [selectedYear, setSelectedYear] = useState<number>(2025);

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
      doc(db, "monthlyResults", `${user.uid}_${selectedYear}_${i + 1}`)
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

  React.useEffect(() => {
    let name = Cookies.get("name");
    if (!name) {
      name = generateRandomName();
      setName(name);
      Cookies.set("name", name, {
        sameSite: "strict",
        expires: 3650,
      });
    } else {
      setName(name);
    }
  }, []);

  // const updateName = React.useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setName(e.target.value);
  //     Cookies.set("name", e.target.value, {
  //       sameSite: "strict",
  //       expires: 3650,
  //     });
  //   },
  //   []
  // );

  const playedPerDay = useMemo(() => {
    const allDaysPlayed: number[] = [];
    yearlyResults.forEach((monthResult, monthIndex) => {
      if (!monthResult) return;

      for (const [day, dayOfResults] of Object.entries(monthResult.results)) {
        const dayInYear = new Date(
          selectedYear,
          monthIndex + 1,
          parseInt(day)
        ).getDayOfYear();
        allDaysPlayed[dayInYear] = dayOfResults.length;
      }
    });
    return allDaysPlayed;
  }, [yearlyResults, selectedYear]);

  return (
    <div className="w-full">
      <div className="flex flex-row items-baseline space-x-1">
        <h1 className="text-base-400">{name}</h1>
        <button className="stroke-base-400">
          <Pencil />
        </button>
      </div>
      <div className="flex flex-row space-x-1">
        <Box title="Played">{playerStats.gamesPlayed}</Box>
        <Box title="Wins">{playerStats.wins}</Box>
        {playerStats && (
          <Box title="Win rate">
            {((playerStats.wins / playerStats.gamesPlayed) * 100).toFixed(0) +
              "%"}
          </Box>
        )}
      </div>
      {playedPerDay.length > 0 && (
        <div>
          <GithubActivityChart data={playedPerDay} year={selectedYear} />
          <GameHistoryChart
            points={[
              [64, 78, 96, 68, 72, 90, 86], // Day 1
              [75, 82, 88], // Day 2
              [70, 92, 85, 89], // Day 3
              [], // Day 4 - skipped
              [88, 95, 82, 91, 87], // Day 5
              [89, 94, 92], // Day 6
              [], // Day 7 - skipped
              [91, 98, 96, 89], // Day 8
              [94, 88, 99, 92, 96], // Day 9
              [95, 102, 98, 97], // Day 10
              [93, 96, 99], // Day 11
              [97, 95, 94, 98], // Day 12
              [], // Day 13 - skipped
              [96, 99, 102, 95], // Day 14
              [98, 101, 97], // Day 15
              [99, 103, 96, 98, 102], // Day 16
              [97, 99, 101], // Day 17
              [], // Day 18 - skipped
              [98, 102, 105, 99], // Day 19
              [101, 104, 98, 103], // Day 20
              [102, 106, 99, 104], // Day 21
              [], // Day 22 - skipped
              [103, 105, 108, 102], // Day 23
              [104, 107, 102, 105], // Day 24
              [105, 109, 103, 106], // Day 25
              [104, 108, 106], // Day 26
              [], // Day 27 - skipped
              [106, 110, 105, 108], // Day 28
              [107, 111, 109, 108], // Day 29
              [108, 112, 110, 109, 111], // Day 30
            ]}
          />
        </div>
      )}
    </div>
  );
};

declare global {
  interface Date {
    getDayOfYear(): number;
  }
}

Date.prototype.getDayOfYear = function () {
  const start = new Date(this.getFullYear(), 0, 0);
  const diff = (this as Date).getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export function Box({
  children,
  title,
}: {
  children: JSX.Element | string | number | undefined;
  title: string;
}) {
  return (
    <div className="border boder-base-700 border-b-3 px-4 py-2 w-24 text-center">
      <div>{title}</div>
      <div className="text-4xl">{children}</div>
    </div>
  );
}

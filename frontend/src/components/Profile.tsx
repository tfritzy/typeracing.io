import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { generateRandomName } from "../helpers/generateRandomName";
import { Pencil } from "../icons/pencil";
import { doc, Firestore, onSnapshot, Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { MonthlyResults, PlayerStats } from "@shared/types";
import { GithubActivityChart } from "./GithubActivityChart";

const emptyPlayerStats: PlayerStats = {
  wins: 0,
  gamesPlayed: 0,
  lastUpdated: Timestamp.now(),
  modeStats: {},
};

export const Profile = ({ db, user }: { db: Firestore; user: User }) => {
  const [name, setName] = useState<string>("");
  const [playerStats, setPlayerStats] = useState<PlayerStats>(emptyPlayerStats);
  const [monthlyResults, setMonthlyResults] = useState<
    MonthlyResults | undefined | null
  >();

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

  const monthlyResultsRef = useMemo(() => {
    return doc(db, "monthlyResults", `${user.uid}_${2025}_${1}`);
  }, [db, user.uid]);

  useEffect(() => {
    if (!monthlyResultsRef) return;

    const unsubscribe = onSnapshot(monthlyResultsRef, (doc) => {
      if (doc.exists()) {
        setMonthlyResults(doc.data() as MonthlyResults);
      } else {
        setMonthlyResults(null);
      }
    });

    return () => unsubscribe();
  }, [db, monthlyResultsRef]);

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

  const updateName = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      Cookies.set("name", e.target.value, {
        sameSite: "strict",
        expires: 3650,
      });
    },
    []
  );

  const playedPerDay = useMemo(() => {
    if (!monthlyResults) {
      return [];
    }

    const daysPlayed = [];
    for (const [day, dayOfResults] of Object.entries(monthlyResults.results)) {
      daysPlayed[parseInt(day)] = dayOfResults.length;
    }
    return daysPlayed;
  }, [monthlyResults]);

  return (
    <div className="w-full">
      <div className="flex flex-row items-baseline space-x-1">
        <h1 className="text-base-300">{name}</h1>
        <button className="stroke-base-300">
          <Pencil />
        </button>
      </div>

      {JSON.stringify(playerStats)}

      {JSON.stringify(monthlyResults)}

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

      {playedPerDay && (
        <div>
          <h2 className="text-lg font-semibold">Activity</h2>
          <GithubActivityChart data={playedPerDay} />
        </div>
      )}
    </div>
  );

  return (
    <input
      className="pl-2 bg-base-700 rounded border border-base-500 outline-none focus:border-accent"
      value={name}
      onChange={updateName}
    />
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
    <div className="border boder-base-700 border-b-3 px-4 py-2 w-24 text-center">
      <div>{title}</div>
      <div className="text-4xl">{children}</div>
    </div>
  );
}

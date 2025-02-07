import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { generateRandomName } from "../helpers/generateRandomName";
import { Pencil } from "../icons/pencil";
import { doc, Firestore, onSnapshot, Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { useAuthToken } from "../hooks/useAuthToken";

export type Player = {
  name: string;
  id: string;
  progress: number;
  wpm: number;
  joinTime: Timestamp;
  place: number;
};

export const Profile = ({ db, user }: { db: Firestore; user: User }) => {
  const token = useAuthToken(user);
  const [name, setName] = useState<string>("");
  const [playerStats, setPlayerStats] = useState<Player | null | undefined>(
    undefined
  );

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

  const docRef = useMemo(() => {
    if (!token) {
      return;
    }

    return doc(db, "playerStats", token);
  }, [db, token]);

  useEffect(() => {
    if (!docRef) return;

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setPlayerStats(doc.data() as Player);
      } else {
        setPlayerStats(null);
      }
    });

    return () => unsubscribe();
  }, [db, docRef]);

  return (
    <div className="w-full">
      <div className="flex flex-row items-baseline space-x-1">
        <h1 className="text-base-300">{name}</h1>
        <button className="stroke-base-300">
          <Pencil />
        </button>
      </div>

      {JSON.stringify(playerStats)}
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

import { useMemo } from "react";
import { DotSpinner } from "./DotSpinner";
import { Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { placeToString } from "../helpers";
import { Bot, Player } from "@shared/types";

type Props = {
  players: Player[];
  bots: Bot[];
  user: User;
  getNow: () => Timestamp;
};

function PlayerComponent({
  name,
  wpm,
  progress,
  isSelf,
  place,
}: {
  name: string | JSX.Element;
  wpm: number;
  progress: number;
  isSelf: boolean;
  place: number;
}) {
  return (
    <div className="text-base-300">
      <div className="flex flex-row justify-between items-end mb-2 pl-1 pr-3">
        <div className="flex flex-row space-x-2">
          <div>
            {name || "Unknown player"} {isSelf && <span>(You)</span>}
          </div>

          {place >= 0 && (
            <div
              className="font-bold"
              style={{
                color: place === 0 ? "var(--accent)" : "var(--base-300)",
              }}
            >
              {placeToString(place)}
            </div>
          )}
        </div>
        <div className="text-base-400">{wpm.toFixed(0)} WPM</div>
      </div>
      <div className="flex flex-row space-x-1">
        <div
          className={`rounded-full h-[4px] transition-all ease-in-out ${
            isSelf ? "bg-accent" : "bg-base-500"
          }`}
          style={{ width: progress + "%" }}
        />
        <div
          className="w-full bg-base-700 rounded-full h-[4px] transition-all ease-in-out"
          style={{ width: 100 - progress + "%" }}
        />
      </div>
    </div>
  );
}

export function Players({ players, bots, user, getNow }: Props) {
  const totalPlayers = players.length + bots.length;
  const playerList = useMemo(() => {
    const allPlayers = [...players];
    for (let i = totalPlayers; i < 3; i++) {
      allPlayers.push({
        id: "loading" + i,
        name: (<DotSpinner />) as unknown as string,
        place: -1,
        progress: 0,
        wpm: 0,
        joinTime: getNow(),
      });
    }

    return (
      <div className="space-y-6">
        {allPlayers.map((p) => (
          <PlayerComponent
            name={p.name || "Guest player"}
            wpm={p.wpm}
            key={p.id}
            progress={p.progress}
            isSelf={p.id === user.uid}
            place={p.place}
          />
        ))}
        {bots.map((p) => (
          <PlayerComponent
            name={p.name}
            wpm={p.wpm}
            key={p.id}
            progress={p.progress}
            isSelf={false}
            place={p.place}
          />
        ))}
      </div>
    );
  }, [bots, getNow, players, totalPlayers, user.uid]);

  return playerList;
}

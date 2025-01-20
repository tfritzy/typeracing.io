import { useMemo } from "react";
import { Bot, Player } from "../types";
import { DotSpinner } from "./DotSpinner";
import { Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";

type Props = {
  players: Player[];
  bots: Bot[];
  user: User;
};

function PlayerComponent({
  name,
  wpm,
  progress,
  isSelf,
}: {
  name: string | JSX.Element;
  wpm: number;
  progress: number;
  isSelf: boolean;
}) {
  return (
    <div className="text-stone-300">
      <div className="flex flex-row justify-between items-end mb-2 pl-3 pr-5">
        <div>{name || "Unknown player"}</div>
        <div>{wpm} WPM</div>
      </div>
      <div className="flex flex-row">
        <div
          className={`rounded-full h-[5px] transition-all ease-in-out ${
            isSelf ? "bg-amber-400" : "bg-amber-400/40"
          }`}
          style={{ width: progress + "%" }}
        />
        <div
          className="w-full bg-stone-700 rounded-full h-[5px] transition-all ease-in-out"
          style={{ width: 100 - progress + "%" }}
        />
      </div>
    </div>
  );
}

export function Players({ players, bots, user }: Props) {
  const totalPlayers = players.length + bots.length;
  const playerList = useMemo(() => {
    const allPlayers = [...players];
    for (let i = totalPlayers; i < 4; i++) {
      allPlayers.push({
        id: "loading" + i,
        name: <DotSpinner />,
        progress: 0,
        wpm: 0,
        joinTime: Timestamp.now(),
      });
    }

    return (
      <div className="space-y-4">
        {allPlayers.map((p) => (
          <PlayerComponent
            name={p.name || "Guest player"}
            wpm={p.wpm}
            key={p.id}
            progress={p.progress}
            isSelf={p.id === user.uid}
          />
        ))}
        {bots.map((p) => (
          <PlayerComponent
            name={p.name}
            wpm={p.wpm}
            key={p.id}
            progress={p.progress}
            isSelf={false}
          />
        ))}
      </div>
    );
  }, [bots, players, totalPlayers]);

  return playerList;
}

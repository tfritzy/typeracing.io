import { useMemo } from "react";
import { Bot, Player } from "../types";
import { DotSpinner } from "./DotSpinner";
import { Timestamp } from "firebase/firestore";

type Props = {
  players: Player[];
  bots: Bot[];
};

function PlayerComponent({
  name,
  wpm,
  progress,
}: {
  name: string | JSX.Element;
  wpm: number;
  progress: number;
}) {
  return (
    <div className="text-stone-300">
      <div className="flex flex-row justify-between items-end mb-2 pl-3 pr-5">
        <div>{name || "Unknown player"}</div>
        <div>{wpm} WPM</div>
      </div>
      <div className="flex flex-row">
        <div
          className="bg-amber-400 rounded-full h-[5px] transition-all ease-in-out"
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

export function Players({ players, bots }: Props) {
  const totalPlayers = players.length + bots.length;
  const playerList = useMemo(() => {
    const allPlayers = [...players];
    for (let i = totalPlayers; i < 4; i++) {
      allPlayers.push({
        id: "loading",
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
          />
        ))}
        {bots.map((p) => (
          <PlayerComponent
            name={p.name}
            wpm={p.wpm}
            key={p.id}
            progress={p.progress}
          />
        ))}
      </div>
    );
  }, [bots, players, totalPlayers]);

  return playerList;
}

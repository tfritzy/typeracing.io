import { Player } from "../types";

type Props = {
  players: Player[];
};

export function Players({ players }: Props) {
  return (
    <div className="space-y-4">
      {players.map((p) => (
        <div className="text-stone-300" key={p.id}>
          <div className="flex flex-row justify-between mb-2 pr-5">
            <div>{p.name || "Unknown player"}</div>
            <div>{p.wpm} WPM</div>
          </div>
          <div className="flex flex-row w-full space-x-2 justify-between">
            <div
              className="bg-amber-400 rounded-full h-[7px] transition-all"
              style={{ width: p.progress + "%" }}
            />
            <div
              className="w-full bg-stone-700 rounded-full h-[7px] transition-all"
              style={{ width: 100 - p.progress + "%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { updatePlayerName } from "./store/playerSlice";

export const ShipEditor = () => {
  const dispatch = useDispatch();
  const playerName = useSelector((state: RootState) => state.player.name);

  return (
    <div className="border border-neutral-200 h-min">
      <div className="text-2xl w-full bg-neutral-200 text-neutral-900 px-4 py-2 uppercase font-semibold">
        Shipyard
      </div>

      <img src="/Ship.svg" alt="Ship" className="w-32 h-32 rotate-45" />

      <div className="p-2">
        <input
          type="text"
          className="w-full bg-neutral-900 border border-neutral-200 px-2 py-1 text-white"
          value={playerName}
          onChange={(e) => dispatch(updatePlayerName(e.target.value))}
        />
      </div>
    </div>
  );
};

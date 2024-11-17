import { RootState } from "../store/store";
import React from "react";
import { updatePlayerName } from "../store/playerSlice";
import EditInput from "./EditInput";
import Cookies from "js-cookie";
import { calculateWpm } from "../helpers/raceResults";
import Tooltip from "../components/Tooltip";
import { useAppDispatch, useAppSelector } from "../store/storeHooks";

export const Profile = () => {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state: RootState) => state.player);
  const raceResults = useAppSelector(
    (state: RootState) => state.player.raceResults
  );
  const currentMode = useAppSelector(
    (state: RootState) => state.player.gameMode
  );

  const wpm = React.useMemo(() => {
    return calculateWpm(raceResults, currentMode);
  }, [currentMode, raceResults]);

  const updateName = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updatePlayerName(e.target.value));
    Cookies.set("name", e.target.value, {
      sameSite: "strict",
      expires: 3650,
    });
  };

  return (
    <div className="flex flex-row rounded-lg space-x-2">
      <div className=" flex flex-row items-center space-x-1">
        <EditInput value={player.name} onChange={updateName} />
      </div>
      <Tooltip content="The average wpm of your past 10 games in the current mode.">
        <div className="rounded-lg py-2 px-3 space-x-1 padding-auto flex flex-row items-center justify-center bg-base-900">
          <span className="text-accent">{wpm || "—"}</span>
          <span className="text-sm text-base-300">wpm</span>
        </div>
      </Tooltip>
    </div>
  );
};

import { RootState } from "../store/store";
import React from "react";
import { updatePlayerName } from "../store/playerSlice";
import Cookies from "js-cookie";
import { calculateWpm } from "../helpers/raceResults";
import { useAppDispatch, useAppSelector } from "../store/storeHooks";
import EditInput from "./EditInput";

export const Profile = () => {
  const [open, setOpen] = React.useState<boolean>(false);
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
    <div>
      <EditInput value={player.name} onChange={updateName} />
    </div>
  );
};

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { AccentColor, NeutralColor, TertiaryTextColor } from "./constants";
import React from "react";
import { updatePlayerName } from "./store/playerSlice";
import EditInput from "./EditInput";
import Cookies from "js-cookie";
import { calculateWpm } from "./helpers/raceResults";

export const Profile = () => {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  const raceResults = useSelector(
    (state: RootState) => state.player.raceResults
  );
  const currentMode = useSelector((state: RootState) => state.player.gameMode);

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
    <div className="flex flex-row p-4 rounded-lg space-x-2">
      <div className=" flex flex-row items-center space-x-1">
        <EditInput value={player.name} onChange={updateName} />
      </div>
      <div
        className="rounded-lg px-3 space-x-1 padding-auto flex flex-row items-center justify-center"
        style={{ backgroundColor: NeutralColor }}
      >
        <span style={{ color: AccentColor }}>{wpm || "—"}</span>
        <span className="text-sm" style={{ color: TertiaryTextColor }}>
          wpm
        </span>
      </div>
    </div>
  );
};

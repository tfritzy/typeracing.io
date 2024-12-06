import { RootState } from "../store/store";
import React from "react";
import { updatePlayerName } from "../store/playerSlice";
import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "../store/storeHooks";
import EditInput from "./EditInput";

export const Profile = () => {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state: RootState) => state.player);

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

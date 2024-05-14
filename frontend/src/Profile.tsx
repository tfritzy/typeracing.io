import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import {
 AccentColor,
 NeutralColor,
 SecondaryTextColor,
 TertiaryTextColor,
 TextColor,
} from "./constants";
import {
 DesignPencil,
 Edit,
 EditPencil,
} from "iconoir-react";
import React from "react";
import { updatePlayerName } from "./store/playerSlice";
import EditInput from "./EditInput";
import Cookies from "js-cookie";

export const Profile = () => {
 const dispatch = useDispatch();
 const player = useSelector(
  (state: RootState) => state.player
 );

 const updateName = (
  e: React.ChangeEvent<HTMLInputElement>
 ) => {
  dispatch(updatePlayerName(e.target.value));
  Cookies.set("name", e.target.value);
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
    <span style={{ color: AccentColor }}>98</span>
    <span
     className="text-sm"
     style={{ color: TertiaryTextColor }}
    >
     wpm
    </span>
   </div>
  </div>
 );
};

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { updatePlayerName } from "./store/playerSlice";
import { EditPencil, Check } from "iconoir-react";

export const ShipEditor = () => {
 const dispatch = useDispatch();
 const playerName = useSelector(
  (state: RootState) => state.player.name
 );

 return (
  <div className="border border-gray-100 h-min">
   <div className="text-2xl w-full bg-gray-100 text-gray-900 px-4 py-2 uppercase font-semibold">
    Shipyard
   </div>

   <img src="/Ship.svg" alt="Ship" className="w-64 h-64" />

   <div className="p-2">
    <input
     type="text"
     className="w-full bg-transparent border border-gray-100 px-2 py-1"
     value={playerName}
     onChange={(e) =>
      dispatch(updatePlayerName(e.target.value))
     }
    />
   </div>
  </div>
 );
};

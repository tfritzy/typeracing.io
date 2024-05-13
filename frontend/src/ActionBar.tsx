import React, { useEffect } from "react";
import {
 Menu,
 RefreshDouble,
 ShareAndroid,
} from "iconoir-react";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "./store/gameSlice";
import {
 NeutralColor,
 SecondaryTextColor,
} from "./constants";
import {
 returnToMainMenu,
 sendFindGameRequest,
} from "./helpers/functions";
import { RootState } from "./store/store";
import { Hotkey } from "./Hotkey";
import { useNavigate } from "react-router-dom";

const TextButton = ({
 children,
 onClick,
}: {
 children: React.ReactNode;
 onClick?: () => void;
}) => {
 return (
  <button
   onClick={onClick}
   className="flex flex-row items-center rounded-full py-2 px-4 space-x-2 text-secondary hover:text-amber-200 outline-none"
  >
   {children}
  </button>
 );
};

type ActionBarProps = {
 sendRequest: (request: ArrayBuffer) => void;
};

export const ActionBar = (props: ActionBarProps) => {
 const navigate = useNavigate();
 const dispatch = useDispatch();
 const player = useSelector(
  (state: RootState) => state.player
 );

 const findGame = React.useCallback(() => {
  dispatch(reset());
  sendFindGameRequest(props.sendRequest, player);
 }, [props.sendRequest, player]);

 const mainMenu = React.useCallback(() => {
  returnToMainMenu(navigate, dispatch);
 }, [reset]);

 useEffect(() => {
  const handleHotkeys = (event: KeyboardEvent) => {
   if (event.key === "p") {
    findGame();
   } else if (event.key === "s") {
    alert("Share");
   } else if (event.key === "m") {
    mainMenu();
   }
  };

  document.addEventListener("keydown", handleHotkeys);

  return () => {
   document.removeEventListener("keydown", handleHotkeys);
  };
 }, [findGame, mainMenu]);

 return (
  <div className="flex flex-col items-center">
   <div
    style={{ backgroundColor: NeutralColor }}
    className="flex flex-row rounded-full"
   >
    <TextButton onClick={findGame}>
     <span>Play again</span>
     <Hotkey code="p" large />
    </TextButton>
    <TextButton onClick={() => dispatch(reset())}>
     <span>Share</span>
     <Hotkey code="s" large />
    </TextButton>
    <TextButton onClick={mainMenu}>
     <span>Main Menu</span>
     <Hotkey code="m" large />
    </TextButton>
   </div>
  </div>
 );
};

import React, { SyntheticEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "./store/gameSlice";
import { NeutralColor, VeryChillBorder } from "./constants";
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
 onClick?: (event: Event) => void;
}) => {
 return (
  <button
   onClick={onClick as any}
   className="flex flex-row space-x-2 items-center rounded-full p-2 hover:text-accent outline-none"
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

 const findGame = React.useCallback(
  (event: Event) => {
   event.preventDefault();
   dispatch(reset());
   navigate("/");
   sendFindGameRequest(props.sendRequest, player);
  },
  [dispatch, navigate, props.sendRequest, player]
 );

 const mainMenu = React.useCallback(() => {
  returnToMainMenu(navigate, dispatch);
 }, [dispatch, navigate]);

 useEffect(() => {
  const handleHotkeys = (event: KeyboardEvent) => {
   if (event.key === "p") {
    findGame(event as Event);
   } else if (event.key === "s") {
    alert("Share");
   } else if (event.key === "m") {
    mainMenu();
    event.preventDefault();
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
    className="flex flex-row rounded-full px-2"
   >
    <TextButton onClick={findGame}>
     <span>Play again</span>
     <Hotkey code="p" />
    </TextButton>

    <div
     className="h-6 m-auto border-r ml-1 mr-1 py-3"
     style={{ borderColor: VeryChillBorder }}
    />

    <TextButton onClick={() => dispatch(reset())}>
     <span>Share</span>
     <Hotkey code="s" />
    </TextButton>

    <div
     className="h-6 m-auto border-r ml-1 mr-1"
     style={{ borderColor: VeryChillBorder }}
    />

    <TextButton onClick={mainMenu}>
     <span>Main Menu</span>
     <Hotkey code="m" />
    </TextButton>
   </div>
  </div>
 );
};

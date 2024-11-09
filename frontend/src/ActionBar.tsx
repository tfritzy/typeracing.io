import React, { useEffect } from "react";
import { returnToMainMenu, sendFindGameRequest } from "./helpers/functions";
import { RootState } from "./store/store";
import { Hotkey } from "./Hotkey";
import { useNavigate } from "react-router-dom";
import { OneofRequest } from "./compiled";
import { useAppSelector, useGameDispatch } from "./store/storeHooks";
import { reset } from "./store/gameSlice";

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
      className="flex w-32 text-text-secondary flex-row space-x-2 items-center justify-center rounded-full p-2 hover:text-accent outline-none"
    >
      {children}
    </button>
  );
};

type ActionBarProps = {
  sendRequest: (request: OneofRequest) => void;
  resetState: () => void;
};

export const ActionBar = (props: ActionBarProps) => {
  const navigate = useNavigate();
  const dispatch = useGameDispatch();
  const player = useAppSelector((state: RootState) => state.player);

  const findGame = React.useCallback(
    (event: Event) => {
      event.preventDefault();
      props.resetState();
      dispatch(reset());
      sendFindGameRequest(props.sendRequest, player);
    },
    [props, dispatch, player]
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
      <div className="flex flex-row rounded-full px-2 bg-background-color border border-border-color shadow-sm shadow-shadow-color">
        <TextButton onClick={findGame}>
          <span>Play again</span>
          <Hotkey code="p" />
        </TextButton>

        <div className="h-6 m-auto border-r ml-1 mr-1 py-3 border-border-color" />

        <TextButton onClick={mainMenu}>
          <span>Main Menu</span>
          <Hotkey code="m" />
        </TextButton>
      </div>
    </div>
  );
};

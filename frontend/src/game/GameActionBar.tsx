import React from "react";
import { returnToMainMenu, sendFindGameRequest } from "../helpers/functions";
import { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { OneofRequest } from "../compiled";
import { useAppSelector, useGameDispatch } from "../store/storeHooks";
import { reset } from "../store/gameSlice";
import { ActionBar } from "../components/ActionBar";

type ActionBarProps = {
  sendRequest: (request: OneofRequest) => void;
  resetState: () => void;
};

export const GameActionBar = (props: ActionBarProps) => {
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

  const options = React.useMemo(() => {
    return [
      {
        name: "Play again",
        hotkey: "p",
        onPress: findGame,
      },
      {
        name: "Main menu",
        hotkey: "m",
        onPress: mainMenu,
      },
    ];
  }, [findGame, mainMenu]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row rounded-full px-2 bg-base-800 border border-base-600 shadow-sm shadow-shadow-color">
        <ActionBar options={options} />
      </div>
    </div>
  );
};

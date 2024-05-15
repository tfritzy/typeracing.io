import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameConfig } from "./GameConfig";
import { TypeBoxButton } from "./TypeBoxButton";
import { sendFindGameRequest } from "./helpers/functions";
import { Profile } from "./Profile";
import { Hotkey } from "./Hotkey";
import { NeutralColor } from "./constants";
import { Logo } from "./Logo";

type MainMenuProps = {
  sendRequest: (request: ArrayBuffer) => void;
};

export const MainMenu = (props: MainMenuProps) => {
  const player = useSelector((state: RootState) => state.player);

  const findGame = React.useCallback(() => {
    sendFindGameRequest(props.sendRequest, player);
  }, [props.sendRequest, player]);

  return (
    <div>
      <div className="absolute left-0 top-0 w-screen h-screen flex flex-col space-y-24 items-center justify-center point">
        <div className="absolute left-0 top-0 w-screen flex flex-row justify-between p-2">
          <Logo />
          <Profile />
        </div>
        <TypeBoxButton phrase="Find game" onPhraseComplete={findGame} />
        <GameConfig
          onClose={() => {
            document.getElementById("type-box")?.focus();
          }}
        />
      </div>
    </div>
  );
};

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameConfig } from "./GameConfig";
import { TypeBoxButton } from "./TypeBoxButton";
import { sendFindGameRequest } from "./helpers/functions";
import { Profile } from "./Profile";
import { Logo } from "./Logo";
import { Countdown } from "./Countdown";

const phrases = [
  "glhf",
  "glgl",
  "ready for dust-off",
  "in the pipe, five by five",
  "let's go",
  "commence bombardment",
  "ready to plunder",
  "fortune favors the bold",
  "let's get into the fight",
  "systems primed",
  "hit it",
  "bring it",
  "oh, it's on",
  "let's do this",
  "it's go time",
  "it's about to get heavy",
  "they'll never know what hit 'em",
];

type MainMenuProps = {
  sendRequest: (request: ArrayBuffer) => void;
};

export const MainMenu = (props: MainMenuProps) => {
  const [phrase] = React.useState(
    phrases[Math.floor(Math.random() * phrases.length)]
  );
  const player = useSelector((state: RootState) => state.player);

  const findGame = React.useCallback(() => {
    sendFindGameRequest(props.sendRequest, player);
  }, [props.sendRequest, player]);

  return (
    <div>
      <div className="relative h-screen flex flex-col space-y-32 items-center justify-center point">
        <div className="absolute left-0 top-0 w-full flex flex-row justify-between p-2">
          <Logo />
          <Profile />
        </div>
        <TypeBoxButton phrase={phrase} onPhraseComplete={findGame} />
        <GameConfig
          onClose={() => {
            document.getElementById("type-box")?.focus();
          }}
        />
      </div>
    </div>
  );
};

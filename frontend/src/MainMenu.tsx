import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameConfig } from "./GameConfig";
import { TypeBoxButton } from "./TypeBoxButton";
import { sendFindGameRequest } from "./helpers/functions";
import { Profile } from "./Profile";
import { Logo } from "./Logo";

const phrases = [
 "Helm, warp one. Engage",
 "glhf",
 "glgl",
 "Ready for dust-off",
 "In the pipe, five by five",
 "Let's go",
 "Commence bombardment",
 "Ready to plunder",
 "Fortune favors the bold",
 "Let's get into the fight",
 "Systems primed",
 "Hit it",
 "Bring it",
 "Oh, it's on",
 "Let's do this",
 "It's go time",
 "It's about to get heavy",
 "They'll never know what hit 'em",
];

type MainMenuProps = {
 sendRequest: (request: ArrayBuffer) => void;
};

export const MainMenu = (props: MainMenuProps) => {
 const [phrase] = React.useState(
  phrases[Math.floor(Math.random() * phrases.length)]
 );
 const player = useSelector(
  (state: RootState) => state.player
 );

 const findGame = React.useCallback(() => {
  sendFindGameRequest(props.sendRequest, player);
 }, [props.sendRequest, player]);

 return (
  <div>
   <div className="relative h-screen flex flex-col space-y-24 items-center justify-center point">
    <div className="absolute left-0 top-0 w-full flex flex-row justify-between p-2">
     <Logo />
     <Profile />
    </div>
    <TypeBoxButton
     phrase={phrase}
     onPhraseComplete={findGame}
    />
    <GameConfig
     onClose={() => {
      document.getElementById("type-box")?.focus();
     }}
    />
   </div>
  </div>
 );
};

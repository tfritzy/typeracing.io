import React from "react";
import { GameConfig } from "./GameConfig";
import { TypeBoxButton } from "../components/TypeBoxButton";
import { Profile } from "./Profile";
import { Logo } from "../components/Logo";
import { useNavigate } from "react-router-dom";

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
  "put me in coach",
];

type MainMenuProps = {};

export const MainMenu = (props: MainMenuProps) => {
  const [phrase] = React.useState(
    phrases[Math.floor(Math.random() * phrases.length)]
  );
  const navigate = useNavigate();

  const findGame = React.useCallback(() => {
    navigate("/in-game");
  }, [navigate]);

  const focusTypeBox = React.useCallback(() => {
    document.getElementById("type-box")?.focus();
  }, []);

  return (
    <div>
      <div className="relative h-screen flex flex-col space-y-32 items-center justify-center point">
        <div className="absolute left-0 top-0 w-full flex flex-row justify-end py-2">
          <Profile />
        </div>
        <TypeBoxButton phrase={phrase} onPhraseComplete={findGame} />
        <GameConfig onClose={focusTypeBox} />
      </div>
    </div>
  );
};
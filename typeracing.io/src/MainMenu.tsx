import React from "react";
import { TypeBoxButton } from "./TypeBoxButton";
import { Firestore } from "firebase/firestore";
import { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { findGame } from "./helpers";

const phrases = [
  "glhf",
  "glgl",
  "ready for dust-off",
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
  "put me in coach",
];

type Props = {
  db: Firestore;
  user: User;
};

export function MainMenu(props: Props) {
  const [phrase] = React.useState(
    phrases[Math.floor(Math.random() * phrases.length)]
  );
  const navigate = useNavigate();

  const createGame = React.useCallback(async () => {
    try {
      findGame(props.user, navigate);
    } catch (err) {
      console.error(err);
    }
  }, [navigate, props.user]);

  return (
    <div className="">
      <TypeBoxButton phrase={phrase} onPhraseComplete={createGame} />
    </div>
  );
}

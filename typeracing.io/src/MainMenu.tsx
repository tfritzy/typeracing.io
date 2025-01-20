import React from "react";
import { TypeBoxButton } from "./TypeBoxButton";
import { Firestore } from "firebase/firestore";
import { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { findGame } from "./helpers";

type Props = {
  db: Firestore;
  user: User;
};

export function MainMenu(props: Props) {
  const navigate = useNavigate();

  const createGame = React.useCallback(async () => {
    try {
      findGame(props.user, navigate);
    } catch (err) {
      console.error(err);
    }
  }, [navigate, props.user]);

  return (
    <div>
      <TypeBoxButton phrase="find game" onPhraseComplete={createGame} />
    </div>
  );
}

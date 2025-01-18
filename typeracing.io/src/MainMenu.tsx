import React from "react";
import { TypeBoxButton } from "./TypeBoxButton";
import { Firestore } from "firebase/firestore";
import { User } from "firebase/auth";
import { API } from "./constants";
import { useNavigate } from "react-router-dom";

type Props = {
  db: Firestore;
  user: User;
};

export function MainMenu(props: Props) {
  const navigate = useNavigate();

  const createGame = React.useCallback(async () => {
    try {
      const token = await props.user.getIdToken();
      console.log(`Bearer ${token}`);

      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: "Test User",
          email: "test@example.com",
        }),
      });

      const data = await response.json();
      console.log("Game created:", data);
      navigate("/race/" + data.id);
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

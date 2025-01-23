import { User } from "firebase/auth";
import { Spinner } from "./components/Spinner";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { findGame } from "./helpers";

type Props = {
  user: User;
};

export function FindRace(props: Props) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function findMatch() {
      try {
        await findGame(props.user, navigate);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to find a game");
      }
    }
    findMatch();
  }, [navigate, props.user]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return <Spinner />;
}

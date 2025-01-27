import { User } from "firebase/auth";
import { Spinner } from "./components/Spinner";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { findGame } from "./helpers";
import { Analytics } from "firebase/analytics";

type Props = {
  user: User;
  analytics: Analytics;
};

export function FindRace(props: Props) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function findMatch() {
      try {
        await findGame(props.user, navigate, props.analytics);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to find a game");
      }
    }
    findMatch();
  }, [navigate, props.analytics, props.user]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <Spinner text="Searching for game" />
    </div>
  );
}

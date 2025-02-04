import { User } from "firebase/auth";
import { Spinner } from "./components/Spinner";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { findGame } from "./helpers";
import { Analytics } from "firebase/analytics";

type Props = {
  user: User;
  analytics: Analytics;
};

export function FindRace({ user, analytics }: Props) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const mode = useParams().mode || "english";
  const hasSearched = useRef(false);

  useEffect(() => {
    if (!hasSearched.current) {
      hasSearched.current = true;

      async function findMatch() {
        try {
          await findGame(user, navigate, analytics, mode);
        } catch (err) {
          console.error(err);
          setError(
            err instanceof Error ? err.message : "Failed to find a game"
          );
        }
      }
      findMatch();
    }
  }, [mode, analytics, navigate, user]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }
  return (
    <div>
      <Spinner text="Searching for game" />
    </div>
  );
}

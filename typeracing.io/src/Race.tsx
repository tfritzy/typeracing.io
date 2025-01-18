import { useState, useEffect, useCallback } from "react";
import { doc, Firestore, onSnapshot, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { useParams } from "react-router-dom";
import { Game } from "./types";
import { Spinner } from "./components/Spinner";
import { TypeBox } from "./TypeBox";
import { Players } from "./components/Players";

// Props type
interface Props {
  db: Firestore;
  user: User;
}

export function Race({ db, user }: Props) {
  const [lockedCharacterIndex, setLockedCharacterIndex] = useState<number>(0);
  const [game, setGame] = useState<Game | null>(null);
  const { gameId } = useParams();

  useEffect(() => {
    if (!gameId) return;

    const docRef = doc(db, "games", gameId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setGame({
          id: doc.id,
          ...(doc.data() as Omit<Game, "id">),
        });
      }
    });

    return () => unsubscribe();
  }, [db, gameId]);

  const handleWordComplete = useCallback(
    (charIndex: number) => {
      setLockedCharacterIndex(charIndex);

      if (!gameId || !game) return;

      const docRef = doc(db, "games", gameId);
      const timeElapsedMinutes =
        (Date.now() - game.startTime.seconds * 1000) / 1000 / 60;
      const wpm =
        timeElapsedMinutes > 0
          ? Math.round(charIndex / 5 / timeElapsedMinutes)
          : 0;

      const updateObject = {
        [`players.${user.uid}.progress`]:
          (charIndex / game.phrase.length) * 100,
        [`players.${user.uid}.wpm`]: wpm,
      };

      updateDoc(docRef, updateObject).catch((error) => {
        console.error("Error updating player progress:", error);
      });
    },
    [db, gameId, game, user.uid]
  );
  if (!game)
    return (
      <div>
        <Spinner />
      </div>
    );

  return (
    <div className="p-4 flex flex-col space-y-6">
      {/* {JSON.stringify(game)} */}

      <Players
        players={Object.values(game.players).sort(
          (a, b) => a.joinTime - b.joinTime
        )}
      />

      <TypeBox
        phrase={game.phrase}
        isLocked={game.status !== "in_progress"}
        lockedCharacterIndex={lockedCharacterIndex}
        onWordComplete={handleWordComplete}
        key="type-box"
      />
    </div>
  );
}

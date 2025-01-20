import { useState, useEffect, useCallback, useMemo } from "react";
import {
  doc,
  Firestore,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { useParams } from "react-router-dom";
import { Game } from "./types";
import { Spinner } from "./components/Spinner";
import { TypeBox } from "./TypeBox";
import { Players } from "./components/Players";
import { ActionBar } from "./components/ActionBar";
import { FILL_GAME } from "./constants";
import { Countdown } from "./components/Countdown";
import { GoLabel } from "./components/GoLabel";

// Props type
interface Props {
  db: Firestore;
  user: User;
}

function RaceInner({ db, user }: Props) {
  const setRerender = useState<number>(0)[1];
  const [lockedCharacterIndex, setLockedCharacterIndex] = useState<number>(0);
  const [game, setGame] = useState<Game | null>(null);
  const { gameId } = useParams();
  const self = game?.players[user.uid];
  const isComplete = self?.progress && self.progress >= 100;

  const docRef = useMemo(() => {
    return gameId ? doc(db, "games", gameId) : null;
  }, [db, gameId]);

  useEffect(() => {
    if (!docRef) return;

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setGame({
          id: doc.id,
          ...(doc.data() as Omit<Game, "id">),
        });
      }
    });

    return () => unsubscribe();
  }, [db, docRef]);

  const handleWordComplete = useCallback(
    (charIndex: number) => {
      setLockedCharacterIndex(charIndex);

      if (!docRef || !game) return;

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
    [docRef, game, user.uid]
  );

  const fillGame = useCallback(async () => {
    try {
      const token = await user.getIdToken();

      if (!game) {
        return;
      }

      await fetch(FILL_GAME, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId: game.id,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  }, [game, user]);

  useEffect(() => {
    if (game?.startTime?.seconds) {
      const timeUntilStart = game.startTime.seconds - Timestamp.now().seconds;
      const fillTime = timeUntilStart - game.countdownDuration_s - 2;
      console.log("fill time", fillTime);

      if (fillTime > 0) {
        const timeoutId = setTimeout(fillGame, fillTime * 1000);
        return () => clearTimeout(timeoutId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.startTime]);

  useEffect(() => {
    if (!game?.startTime || !docRef) return;

    const intervalId = setInterval(() => {
      if (Timestamp.now().seconds < game.startTime.seconds + 3) {
        setRerender(Math.random());
      }

      const elapsedSeconds = Timestamp.now().seconds - game.startTime.seconds;
      if (elapsedSeconds > 0) {
        for (const b of Object.values(game.bots)) {
          const expectedCharacterCount =
            (elapsedSeconds / 60) * b.targetWpm * 5;
          const expectedProgress = Math.min(
            (expectedCharacterCount / game.phrase.length) * 100,
            100
          );
          if (
            expectedProgress - b.progress > 5 ||
            (expectedProgress === 100 && b.progress !== 100)
          ) {
            const updateObject = {
              [`bots.${b.id}.progress`]: expectedProgress,
              [`bots.${b.id}.wpm`]: b.targetWpm,
            };

            updateDoc(docRef, updateObject).catch((error) => {
              console.error("Error updating player progress:", error);
            });
          }
        }
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [
    docRef,
    game?.bots,
    game?.phrase.length,
    game?.players,
    game?.startTime,
    setRerender,
  ]);

  if (!game)
    return (
      <div>
        <Spinner />
      </div>
    );

  let message;
  switch (game.status) {
    case "in_progress":
      message = <Countdown startTime={game.startTime} />;
      break;
    case "waiting":
      message = "Waiting for players...";
      break;
    default:
      message = "";
  }

  const isLocked = Timestamp.now() < game.startTime;
  return (
    <div className="p-4 flex flex-col space-y-6" key={gameId}>
      <Players
        players={Object.values(game.players).sort(
          (a, b) => a.joinTime.seconds - b.joinTime.seconds
        )}
        bots={Object.values(game.bots).sort(
          (a, b) => a.joinTime.seconds - b.joinTime.seconds
        )}
        user={user}
      />

      <div className="">
        <div className="bg-stone-700 max-w-fit rounded-t-lg px-4 text-stone-400 font-bold py-[2px]">
          {message}
        </div>
        <div className="relative border-4 rounded-b-lg rounded-r-lg border-stone-700 px-4 py-3">
          <div className="absolute -left-12 top-0">
            <GoLabel startTime={game.startTime} />
          </div>
          <TypeBox
            phrase={game.phrase}
            isLocked={isLocked}
            lockedCharacterIndex={lockedCharacterIndex}
            onWordComplete={handleWordComplete}
            key={gameId}
          />
        </div>
      </div>

      {isComplete ? (
        <div className="flex flex-col items-center">
          <ActionBar user={user} />
        </div>
      ) : null}
    </div>
  );
}

export function Race({ db, user }: Props) {
  const { gameId } = useParams();
  return <RaceInner db={db} user={user} key={gameId} />;
}

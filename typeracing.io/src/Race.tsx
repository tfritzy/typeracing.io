import { useState, useEffect, useCallback, useMemo } from "react";
import {
  doc,
  Firestore,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { Navigate, useParams } from "react-router-dom";
import { Game } from "./types";
import { Spinner } from "./components/Spinner";
import { TypeBox } from "./TypeBox";
import { Players } from "./components/Players";
import { ActionBar } from "./components/ActionBar";
import { FILL_GAME } from "./constants";
import { Countdown } from "./components/Countdown";
import { GoLabel } from "./components/GoLabel";
import { KeyStroke } from "./stats";
import { StatsModal } from "./StatsModal";
import { Analytics, logEvent } from "firebase/analytics";

interface Props {
  db: Firestore;
  user: User;
  analytics: Analytics;
}

function RaceInner({ db, user, analytics }: Props) {
  const [hasCompletedRace, setHasCompletedRace] = useState(false);
  const setRerender = useState<number>(0)[1];
  const [statsClosed, setStatsClosed] = useState<boolean>(false);
  const [lockedCharacterIndex, setLockedCharacterIndex] = useState<number>(0);
  const [keystrokes, setKeystrokes] = useState<KeyStroke[]>([]);
  const [game, setGame] = useState<Game | null | undefined>(undefined);
  const { gameId } = useParams();
  const self = game?.players[user.uid];
  const isComplete = !!self?.progress && self.progress >= 100;

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
      } else {
        setGame(null);
      }
    });

    return () => unsubscribe();
  }, [db, docRef]);

  const closeStats = useCallback(() => {
    setStatsClosed(true);
  }, []);

  const toggleStats = useCallback(() => {
    setStatsClosed(!statsClosed);
  }, [statsClosed]);

  const onFirstKeystroke = useCallback(() => {
    logEvent(analytics, "race_started");
  }, [analytics]);

  const handleWordComplete = useCallback(
    (charIndex: number, newKeystrokes: KeyStroke[]) => {
      if (hasCompletedRace) return;

      for (let i = 0; i < newKeystrokes.length; i++) {
        newKeystrokes[i].time = new Timestamp(
          newKeystrokes[i].time!.seconds - game!.startTime.seconds,
          newKeystrokes[i].time!.nanoseconds
        );
      }

      setKeystrokes([...keystrokes, ...newKeystrokes]);
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

      if (charIndex >= game.phrase.length) {
        setHasCompletedRace(true);
        const highestPlace = Math.max(
          ...Object.values(game.players).map((p) => p.place),
          ...Object.values(game.bots).map((b) => b.place)
        );
        updateObject[`players.${user.uid}.place`] = highestPlace + 1;
        logEvent(analytics, "race_finished", { place: highestPlace + 1 });
      }

      updateDoc(docRef, updateObject).catch((error) => {
        console.error("Error updating player progress:", error);
      });
    },
    [analytics, docRef, game, hasCompletedRace, keystrokes, user.uid]
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
    if (game?.status === "waiting" && game?.botFillTime) {
      const now = Timestamp.now();
      const timeUntilFill = game.botFillTime.seconds - now.seconds;

      if (timeUntilFill <= 0) {
        fillGame();
      } else {
        const timerId = setTimeout(() => {
          if (game.status === "waiting") {
            fillGame();
          }
        }, timeUntilFill * 1000);

        return () => clearTimeout(timerId);
      }
    }
  }, [fillGame, game?.botFillTime, game?.status]);

  useEffect(() => {
    if (!game?.startTime || !docRef) return;

    const intervalId = setInterval(() => {
      const elapsedSeconds = Timestamp.now().seconds - game.startTime.seconds;

      if (elapsedSeconds > 0) {
        const updateObject: {
          [key: `bots.${string}.progress`]: number;
          [key: `bots.${string}.wpm`]: number;
          [key: `bots.${string}.place`]: number;
        } = {};
        let highestPlace = Math.max(
          ...Object.values(game.players).map((p) => p.place),
          ...Object.values(game.bots).map((b) => b.place)
        );

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
            updateObject[`bots.${b.id}.progress`] = expectedProgress;
            updateObject[`bots.${b.id}.wpm`] = b.targetWpm;

            if (expectedProgress >= 100) {
              highestPlace++;
              updateObject[`bots.${b.id}.place`] = highestPlace;
            }
          }
        }

        // Only make the update request if there are changes to make
        if (Object.keys(updateObject).length > 0) {
          updateDoc(docRef, updateObject).catch((error) => {
            console.error("Error updating bot progress:", error);
          });
        }
      }
    }, 250);

    return () => clearInterval(intervalId);
  }, [game?.startTime, docRef, game?.bots, game?.players, game?.phrase.length]);

  useEffect(() => {
    if (!game?.startTime) return;

    const now = Timestamp.now();
    const delayMs =
      (game.startTime.seconds - now.seconds) * 1000 +
      (game.startTime.nanoseconds - now.nanoseconds) / 1000000;

    const hideTimer = setTimeout(() => setRerender(Math.random()), delayMs);
    return () => {
      clearTimeout(hideTimer);
    };
  }, [game?.startTime, setRerender]);

  const stats = useMemo(() => {
    if (!game) {
      return null;
    }

    return (
      <StatsModal
        keystrokes={keystrokes}
        onClose={closeStats}
        shown={isComplete && !statsClosed}
        phrase={game.phrase}
        place={game.players[user.uid].place}
      />
    );
  }, [closeStats, game, isComplete, keystrokes, statsClosed, user.uid]);

  const actionBar = useMemo(() => {
    if (!isComplete) {
      return null;
    }

    return (
      <div className="flex flex-col items-center">
        <ActionBar showStats={toggleStats} mode={game?.mode} />
      </div>
    );
  }, [game?.mode, isComplete, toggleStats]);

  if (game === null) return <Navigate to="/" />;
  if (game === undefined) return <Spinner text="Found game" />;

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

  if (isComplete) {
    message = "Finished";
  }

  const isLocked = Timestamp.now() < game.startTime || isComplete;
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
        <div className="bg-base-700 max-w-fit rounded-t-lg px-4 text-base-400 font-bold py-[2px]">
          {message}
        </div>
        <div className="relative border-4 rounded-b-lg rounded-r-lg border-base-700 px-4 py-3">
          <div className="absolute -left-12 top-0">
            <GoLabel startTime={game.startTime} />
          </div>
          <TypeBox
            phrase={game.phrase}
            isLocked={isLocked}
            lockedCharacterIndex={lockedCharacterIndex}
            onWordComplete={handleWordComplete}
            key={gameId}
            onFirstKeystroke={onFirstKeystroke}
          />
        </div>
      </div>

      {stats}

      {actionBar}
    </div>
  );
}

export function Race({ db, user, analytics }: Props) {
  const { gameId } = useParams();
  return <RaceInner db={db} user={user} key={gameId} analytics={analytics} />;
}

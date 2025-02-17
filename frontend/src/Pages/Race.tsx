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
import { Spinner } from "../components/Spinner";
import { TypeBox } from "../components/TypeBox";
import { Players } from "../components/Players";
import { ActionBar } from "../components/ActionBar";
import { Countdown } from "../components/Countdown";
import { GoLabel } from "../components/GoLabel";
import { getWpm, KeyStroke } from "../stats";
import { StatsModal } from "../components/StatsModal";
import { Analytics, logEvent } from "firebase/analytics";
import { getFillGameUrl, reportResult } from "../helpers";
import { Game } from "@shared/types";

interface SharedProps {
  db: Firestore;
  user: User | null;
  analytics: Analytics;
  getNow: () => Timestamp;
}

type ExternalProps = SharedProps & {
  user: User | null;
};

type InternalProps = SharedProps & {
  user: User;
};

function RaceInner({ db, user, analytics, getNow }: InternalProps) {
  const [hasCompletedRace, setHasCompletedRace] = useState(false);
  const setRerender = useState<number>(0)[1];
  const [statsClosed, setStatsClosed] = useState<boolean>(false);
  const [keystrokes, setKeystrokes] = useState<KeyStroke[]>([]);
  const [game, setGame] = useState<Game | null | undefined>(undefined);
  const { gameId } = useParams();
  const self = game?.players[user?.uid || ""];
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
    async (charIndex: number, keystrokes: KeyStroke[]) => {
      if (hasCompletedRace || (self?.place && self.place > 0)) return;

      if (!docRef || !game) return;

      const wpm = getWpm(keystrokes);
      const updateObject = {
        [`players.${user.uid}.progress`]:
          (charIndex / game.phrase.length) * 100,
        [`players.${user.uid}.wpm`]: wpm,
      };

      const isGameComplete = charIndex >= game.phrase.length;

      if (isGameComplete) {
        if (self?.place && self.place > 0) {
          return;
        }

        setHasCompletedRace(true);
        const highestPlace = Math.max(
          ...Object.entries(game.players)
            .filter(([id]) => id !== user.uid)
            .map(([_, p]) => p.place),
          ...Object.values(game.bots).map((b) => b.place)
        );
        updateObject[`players.${user.uid}.place`] = highestPlace + 1;
      }

      try {
        await updateDoc(docRef, updateObject);

        if (isGameComplete) {
          await reportResult(user, game.id);
        }
      } catch {
        setHasCompletedRace(false);
      }
    },
    [docRef, game, hasCompletedRace, self?.place, user]
  );

  const handlePhraseComplete = useCallback((keystrokes: KeyStroke[]) => {
    setKeystrokes(keystrokes);
  }, []);

  const fillGame = useCallback(async () => {
    try {
      const token = await user.getIdToken();

      if (!game) {
        return;
      }

      await fetch(getFillGameUrl(), {
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
      const now = getNow();
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
  }, [fillGame, game?.botFillTime, game?.status, getNow]);

  useEffect(() => {
    if (!game?.startTime || !docRef) return;

    const intervalId = setInterval(() => {
      const elapsedSeconds = getNow().seconds - game.startTime.seconds;

      if (elapsedSeconds > 0) {
        const updateObject: {
          [key: `bots.${string}.progress`]: number;
          [key: `bots.${string}.wpm`]: number;
          [key: `bots.${string}.place`]: number;
        } = {};
        let highestPlace = -1;
        const players = game.players;
        const bots = game.bots;
        for (const id in players) {
          const place = players[id].place;
          if (place > highestPlace) highestPlace = place;
        }
        for (const id in bots) {
          const place = bots[id].place;
          if (place > highestPlace) highestPlace = place;
        }

        for (const b of Object.values(bots)) {
          const expectedCharacterCount =
            (elapsedSeconds / 60) * b.targetWpm * 5;
          const expectedProgress = Math.min(
            (expectedCharacterCount / game.phrase.length) * 100,
            100
          );

          if (expectedProgress - b.progress > 5) {
            updateObject[`bots.${b.id}.progress`] = Math.min(
              expectedProgress,
              b.progress + 5
            );
          } else if (expectedProgress >= 100 && b.progress < 100) {
            updateObject[`bots.${b.id}.progress`] = Math.min(
              100,
              b.progress + 5
            );
          }

          if (expectedProgress >= 100 && b.progress < 100) {
            highestPlace++;
            updateObject[`bots.${b.id}.place`] = highestPlace;
          }

          if (b.wpm !== b.targetWpm) {
            updateObject[`bots.${b.id}.wpm`] = b.targetWpm;
          }
        }

        // Only make the update request if there are changes to make
        if (Object.keys(updateObject).length > 0) {
          updateDoc(docRef, updateObject).catch((error) => {
            console.error("Error updating bot progress:", error);
          });
        }
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [
    game?.startTime,
    docRef,
    game?.bots,
    game?.players,
    game?.phrase.length,
    getNow,
  ]);

  useEffect(() => {
    if (!game?.startTime) return;

    const now = getNow();
    const delayMs =
      (game.startTime.seconds - now.seconds) * 1000 +
      (game.startTime.nanoseconds - now.nanoseconds) / 1000000;

    const hideTimer = setTimeout(() => setRerender(Math.random()), delayMs);
    return () => {
      clearTimeout(hideTimer);
    };
  }, [game?.startTime, getNow, setRerender]);

  const stats = useMemo(() => {
    if (!game?.phrase || !self?.id) {
      return null;
    }

    return (
      <StatsModal
        key="stats-modal"
        keystrokes={keystrokes}
        onClose={closeStats}
        shown={isComplete && !statsClosed}
        phrase={game.phrase}
        place={self.place}
      />
    );
  }, [
    game?.phrase,
    self?.id,
    self?.place,
    keystrokes,
    closeStats,
    isComplete,
    statsClosed,
  ]);

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
      message = <Countdown startTime={game.startTime} getNow={getNow} />;
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

  const isLocked = getNow() < game.startTime || isComplete;
  return (
    <>
      <div className="flex flex-col flex-1 space-y-12 w-full" key={gameId}>
        <div className="grow flex flex-col justify-end">
          <Players
            players={Object.values(game.players).sort(
              (a, b) => a.joinTime.seconds - b.joinTime.seconds
            )}
            bots={Object.values(game.bots).sort(
              (a, b) => a.joinTime.seconds - b.joinTime.seconds
            )}
            user={user}
            getNow={getNow}
          />
        </div>
        <div className="shrink">
          <div className="bg-base-700 max-w-fit rounded-t-lg px-4 text-base-400 font-bold py-[2px]">
            {message}
          </div>
          <div className="relative border-4 rounded-b-lg rounded-r-lg border-base-700 px-4 py-3">
            <div className="absolute -left-12 top-0">
              <GoLabel startTime={game.startTime} getNow={getNow} />
            </div>
            <TypeBox
              phrase={game.phrase}
              isLocked={isLocked}
              onPhraseComplete={handlePhraseComplete}
              onWordComplete={handleWordComplete}
              key={gameId}
              onFirstKeystroke={onFirstKeystroke}
              getNow={getNow}
              startTime={game.startTime}
            />
          </div>
        </div>

        <div className="grow-[2]">{actionBar}</div>
      </div>
      {stats}
    </>
  );
}

export function Race({ db, user, analytics, getNow }: ExternalProps) {
  const { gameId } = useParams();

  if (!user) return <Spinner />;

  return (
    <RaceInner
      db={db}
      user={user!}
      key={gameId}
      analytics={analytics}
      getNow={getNow}
    />
  );
}

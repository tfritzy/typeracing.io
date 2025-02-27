import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { BotNames } from "./botNameGenerator.js";
import { getPhrase } from "./getPhrase.js";
import {
  Bot,
  Game,
  GameResult,
  GlobalYearlyStats,
  ModeType,
  MonthlyResults,
  PlayerStats,
} from "@shared/types.js";
import { getDayOfYear } from "./dateHelpers.js";

const RACE_SIZE = 3;

initializeApp({ projectId: "typeracing-io" });
const db = getFirestore();
const auth = getAuth();

export interface FindGameRequest {
  displayName: string | undefined;
  mode: ModeType | undefined;
}

export interface FindGameResponse {
  id: string;
  message: string;
}

export const findGame = onRequest({ cors: true }, async (req, res) => {
  try {
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "*");
      res.set("Access-Control-Max-Age", "3600");
      res.status(204).send("");
      return;
    }

    let { displayName, mode } = req.body as FindGameRequest;
    mode ||= "english";

    // Get the authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    // Verify the token
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const phrase = getPhrase(mode).join(" ");
    const fifteenSecondsAgo = Timestamp.fromDate(new Date(Date.now() - 15000));

    switch (req.method) {
      case "POST": {
        const querySnapshot = await db
          .collection("games")
          .where("status", "==", "waiting")
          .where("createdTime", ">=", fifteenSecondsAgo)
          .where("mode", "==", mode)
          .get();

        const games: Array<{ id: string } & Game> = [];
        querySnapshot.forEach((doc) => {
          games.push({
            ...(doc.data() as Game),
            id: doc.id,
          });
        });

        const now = Timestamp.now();
        let gameId: string;

        if (games.length) {
          gameId = games[0].id;
          await db.runTransaction(async (transaction) => {
            const gameRef = db.collection("games").doc(games[0].id);
            const gameDoc = await transaction.get(gameRef);
            const gameData = gameDoc.data() as Game;

            const playerCount = Object.keys(gameData.players || {}).length;
            if (playerCount >= RACE_SIZE) {
              throw new Error("Game is full");
            }

            await transaction.update(gameRef, {
              status:
                playerCount >= RACE_SIZE ? "in_progress" : gameData.status,
              startTime:
                playerCount >= RACE_SIZE
                  ? new Timestamp(now.seconds + 3, now.nanoseconds)
                  : gameData.startTime,
              players: {
                ...gameData.players,
                [uid]: {
                  progress: 0,
                  wpm: 0,
                  id: uid,
                  joinTime: Timestamp.now(),
                  place: -1,
                  name: displayName,
                },
              },
            });
          });
        } else {
          const newGame: Omit<Game, "id"> = {
            createdTime: Timestamp.now(),
            botFillTime: new Timestamp(now.seconds + 5, now.nanoseconds),
            startTime: new Timestamp(now.seconds + 10000, now.nanoseconds),
            status: "waiting",
            mode: mode || "english",
            bots: {},
            players: {
              [uid]: {
                progress: 0,
                wpm: 0,
                id: uid,
                joinTime: now,
                place: -1,
                name: displayName || "guest",
              },
            },
            phrase: phrase,
          };

          const game = await db.collection("games").add(newGame);
          gameId = game.id;
        }

        const response: FindGameResponse = {
          id: gameId,
          message: "Found game successfully",
        };
        res.json(response);
        break;
      }
      default:
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("Error processing request:", error);
    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/argument-error"
    ) {
      res.status(401).json({ error: "Invalid or expired token" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export interface FillGameWithBotsRequest {
  gameId: string | undefined;
}

export interface FillGameWithBotsResponse {
  message: string;
}

export const fillGameWithBots = onRequest({ cors: true }, async (req, res) => {
  try {
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "*");
      res.set("Access-Control-Max-Age", "3600");
      res.status(204).send("");
      return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    switch (req.method) {
      case "POST": {
        const { gameId } = req.body as FillGameWithBotsRequest;
        if (!gameId) {
          res.status(400).json({ error: "Game ID is required" });
          return;
        }
        const gameRef = db.collection("games").doc(gameId);
        await db.runTransaction(async (transaction) => {
          const gameDoc = await transaction.get(gameRef);
          if (!gameDoc.exists) {
            throw new Error("Game not found");
          }
          const gameData = gameDoc.data() as Game;

          if (gameData.status === "in_progress") {
            throw new Error("Game is already in progress");
          }
          if (gameData.bots && Object.keys(gameData.bots).length > 0) {
            throw new Error("Game already has bots");
          }

          if (!gameData.players[uid]) {
            throw new Error("Must be in game to make this request");
          }

          const currentPlayerCount = Object.keys(gameData.players || {}).length;
          const botsNeeded = RACE_SIZE - currentPlayerCount;
          if (botsNeeded <= 0) {
            throw new Error("Game is already full");
          }

          const botPlayers: Record<string, Bot> = {};
          const now = Timestamp.now();
          for (let i = 0; i < botsNeeded; i++) {
            const botId = `bot-${Date.now()}-${i}`;
            const targetWpm = Math.floor((Math.random() - 0.5) * 40 + 50);
            botPlayers[botId] = {
              progress: 0,
              wpm: 0,
              id: botId,
              place: -1,
              joinTime: new Timestamp(now.seconds + i, now.nanoseconds),
              name: BotNames.generateName(targetWpm),
              targetWpm: targetWpm,
            };
          }

          const updateData = {
            status: "in_progress" as const,
            startTime: new Timestamp(now.seconds + 3, now.nanoseconds),
            bots: botPlayers,
            botsAddedAt: now,
          };

          transaction.update(gameRef, updateData);
        });

        const response: FillGameWithBotsResponse = {
          message: "thumbs up",
        };
        res.json(response);
        break;
      }
      default:
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("Error processing request:", error);
    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/argument-error"
    ) {
      res.status(401).json({ error: "Invalid or expired token" });
    } else if (error.message) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

interface RecordGameResultRequest {
  gameId: string;
}

interface RecordGameResultResponse {
  message: string;
  result: GameResult;
}

export const recordGameResult = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "*");
      res.set("Access-Control-Max-Age", "3600");
      res.status(204).send("");
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    switch (req.method) {
      case "POST": {
        const { gameId } = req.body as RecordGameResultRequest;

        if (!gameId) {
          res.status(400).json({ error: "Game ID is required" });
          return;
        }

        const gameRef = db.collection("games").doc(gameId);
        const gameDoc = await gameRef.get();

        if (!gameDoc.exists) {
          res.status(404).json({ error: "Game not found" });
          return;
        }

        const gameData = gameDoc.data() as Game;

        const player = gameData.players[uid];
        if (!player) {
          res.status(403).json({ error: "Player was not in this game" });
          return;
        }

        if (player.place === -1) {
          res
            .status(400)
            .json({ error: "Game is not finished for this player" });
          return;
        }

        const now = Timestamp.now();
        const date = now.toDate();
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        const gameResult: GameResult = {
          game: gameId,
          mode: gameData.mode,
          wpm: player.wpm,
          place: player.place,
          length: gameData.phrase.length,
        };

        let isFirstGameInMode: boolean = false;
        let isFirstGame: boolean = false;
        await db.runTransaction(async (transaction) => {
          const monthlyResultsRef = db
            .collection("monthlyResults")
            .doc(`${uid}_${year}_${month}`);
          const monthlyResultsDoc = await transaction.get(monthlyResultsRef);

          let monthlyResults: MonthlyResults;
          if (!monthlyResultsDoc.exists) {
            monthlyResults = {
              year,
              month,
              results: {
                [day]: [gameResult],
              },
            };
            isFirstGame = true;
            isFirstGameInMode = true;
          } else {
            monthlyResults = monthlyResultsDoc.data() as MonthlyResults;
            if (!monthlyResults.results[day]) {
              monthlyResults.results[day] = [];
              isFirstGame = true;
            }

            isFirstGameInMode = !monthlyResults.results[day].some(
              (g) => g.mode === gameData.mode
            );
            monthlyResults.results[day].push(gameResult);
          }

          const playerStatsRef = db.collection("playerStats").doc(uid);
          const playerStatsDoc = await transaction.get(playerStatsRef);

          const currentStats: PlayerStats = playerStatsDoc.exists
            ? (playerStatsDoc.data() as PlayerStats)
            : {
                gamesPlayed: 0,
                wins: 0,
                lastUpdated: now,
                modeStats: {},
              };

          if (!currentStats.modeStats[gameData.mode]) {
            currentStats.modeStats[gameData.mode] = {
              gamesPlayed: 0,
              bestWpm: 0,
              totalWpm: 0,
              averageWpm: 0,
            };
          }

          const modeStats = currentStats.modeStats[gameData.mode]!;
          const newModeGamesPlayed = modeStats.gamesPlayed + 1;
          const newModeTotalWpm = modeStats.totalWpm + player.wpm;

          currentStats.modeStats[gameData.mode] = {
            gamesPlayed: newModeGamesPlayed,
            bestWpm: Math.max(modeStats.bestWpm, player.wpm),
            totalWpm: newModeTotalWpm,
            averageWpm: Math.round(newModeTotalWpm / newModeGamesPlayed),
          };

          currentStats.gamesPlayed += 1;
          if (player.place === 0) {
            currentStats.wins += 1;
          }
          currentStats.lastUpdated = now;

          transaction.set(monthlyResultsRef, monthlyResults);
          transaction.set(playerStatsRef, currentStats);
        });

        updateGlobalStats(db, gameData.mode, isFirstGame, isFirstGameInMode);

        const response: RecordGameResultResponse = {
          message: "Game result recorded successfully",
          result: gameResult,
        };

        res.json(response);
        break;
      }
      default:
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("Error processing request:", error);
    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/argument-error"
    ) {
      res.status(401).json({ error: "Invalid or expired token" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

async function updateGlobalStats(
  db: FirebaseFirestore.Firestore,
  mode: ModeType,
  isFirstGameOfDay: boolean,
  isFirstGameOfDayInMode: boolean
) {
  const today = new Date();
  const year = today.getFullYear().toString();
  const dayOfYear = getDayOfYear(today).toString();

  const statsRef = db.collection("globalStats").doc(year);

  await db.runTransaction(async (transaction) => {
    const statsDoc = await transaction.get(statsRef);

    let yearStats: GlobalYearlyStats = {
      year: year,
      days: {},
    };

    if (statsDoc.exists) {
      yearStats = statsDoc.data() as GlobalYearlyStats;
    }

    if (!yearStats.days[dayOfYear]) {
      yearStats.days[dayOfYear] = {
        playerCounts: {},
        gameCounts: {},
        totalPlayerCount: 0,
      };
    }

    if (!yearStats.days[dayOfYear].gameCounts[mode]) {
      yearStats.days[dayOfYear].gameCounts[mode] = 0;
    }

    if (!yearStats.days[dayOfYear].playerCounts[mode]) {
      yearStats.days[dayOfYear].playerCounts[mode] = 0;
    }

    yearStats.days[dayOfYear].gameCounts[mode]++;

    if (isFirstGameOfDayInMode) {
      yearStats.days[dayOfYear].playerCounts[mode]++;
    }

    if (isFirstGameOfDay) {
      yearStats.days[dayOfYear].totalPlayerCount++;
    }

    transaction.set(statsRef, yearStats, { merge: true });
  });
}

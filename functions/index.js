import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { words } from "./words.js";
import {BotNames} from './botNameGenerator.js'

export const getRandomElements = (arr, n) =>
  arr.sort(() => Math.random() - 0.5).slice(0, n);

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();
const auth = getAuth();

// HTTP endpoint
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

    const phrase = getRandomElements(words, 20).join(" ");

    switch (req.method) {
      case "POST": {
        const querySnapshot = await db
          .collection("games")
          .where("status", "==", "waiting")
          .get();
        const games = [];
        querySnapshot.forEach((doc) => {
          games.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        const now = Timestamp.now();
        let gameId;
        if (games.length) {
          gameId = games[0].id;
          await db.runTransaction(async (transaction) => {
            const gameRef = db.collection("games").doc(games[0].id);
            const gameDoc = await transaction.get(gameRef);
            const gameData = gameDoc.data();

            const playerCount = Object.keys(gameData.players || {}).length;
            if (playerCount >= 4) {
              throw new Error("Game is full");
            }

            await transaction.update(gameRef, {
              status: playerCount >= 4 ? "in_progress" : gameData.status,
              startTime:
                playerCount >= 4
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
                },
              },
            });
          });
        } else {
          const game = await db.collection("games").add({
            createdBy: uid,
            botFillTime: new Timestamp(now.seconds + 7, now.nanoseconds),
            startTime: new Timestamp(now.seconds + 10000, now.nanoseconds),
            status: "waiting",
            bots: [],
            players: {
              [uid]: {
                // player
                progress: 0,
                wpm: 0,
                id: uid,
                joinTime: now,
                place: -1,
              },
            },
            phrase: phrase,
          });
          gameId = game.id;
        }

        res.json({
          id: gameId,
          message: "Found game successfully",
        });
        break;
      }
      default:
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
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
        const { gameId } = req.body;
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

          const gameData = gameDoc.data();

          if (!gameData.players[uid]) {
            throw new Error("Must be in game to make this request");
          }

          const currentPlayerCount = Object.keys(gameData.players || {}).length;
          const botsNeeded = 4 - currentPlayerCount;

          if (botsNeeded <= 0) {
            throw new Error("Game is already full");
          }

          const botPlayers = {};
          const now = Timestamp.now();
          for (let i = 0; i < botsNeeded; i++) {
            const botId = `bot-${Date.now()}-${i}`;
            const targetWpm = Math.floor((Math.random() - .5) * 40 + 50);
            botPlayers[botId] = {
              // player
              progress: 0,
              wpm: 0,
              id: botId,
              place: -1,
              joinTime: new Timestamp(now.seconds + i, now.nanoseconds),
              isBot: true,
              name: BotNames.generateName(targetWpm),
              targetWpm: targetWpm,
            };
          }

          transaction.update(gameRef, {
            status: "in_progress",
            startTime: new Timestamp(now.seconds + 3, now.nanoseconds),
            bots: botPlayers,
          });
        });

        res.json({
          message: "thumbs up",
        });
        break;
      }
      default:
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/argument-error"
    ) {
      res.status(401).json({ error: "Invalid or expired token" });
    } else if (error.message) {
      // Handle custom error messages from the transaction
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

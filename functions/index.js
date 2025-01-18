import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { words } from "./words.js";

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

        let gameRef;
        if (games.length) {
          const game = games[0];
          gameRef = db.collection("games").doc(game.id);

          await gameRef.update({
            status: "in_progress",
            startTime: new Date(),
            players: {
              ...game.players,
              [uid]: {
                progress: 0,
                wpm: 0,
                id: uid,
                joinTime: new Date(),
              },
            },
          });
        } else {
          gameRef = await db.collection("games").add({
            createdBy: uid,
            startTime: new Date(),
            createdAt: new Date(),
            status: "waiting",
            players: {
              [uid]: {
                progress: 0,
                wpm: 0,
                id: uid,
                joinTime: new Date(),
              },
            },
            phrase: phrase,
          });
        }

        res.json({
          id: gameRef.id,
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

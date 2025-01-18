import { Timestamp } from "firebase/firestore";

export type Player = {
  name: string;
  id: string;
  progress: number;
  wpm: number;
  joinTime: number;
};

export type Game = {
  id: string;
  createdAt: Timestamp;
  players: { [playerId: string]: Player };
  phrase: string;
  status: "in_progress" | "waiting";
  startTime: Timestamp;
};

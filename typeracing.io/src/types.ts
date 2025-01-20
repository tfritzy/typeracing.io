import { Timestamp } from "firebase/firestore";

type BotConfig = {
  wpm: number;
};

export type Player = {
  name: JSX.Element | string;
  id: string;
  progress: number;
  wpm: number;
  joinTime: Timestamp;
  botConfig?: BotConfig;
};

export type Bot = Player & { targetWpm: number };

export type Game = {
  id: string;
  createdAt: Timestamp;
  players: { [playerId: string]: Player };
  bots: Bot[];
  phrase: string;
  status: "in_progress" | "waiting";
  startTime: Timestamp;
  countdownDuration_s: number;
};

import { Timestamp } from "firebase/firestore";
import { Mode } from "./modes";

type BotConfig = {
  wpm: number;
};

export type Player = {
  name: JSX.Element | string;
  id: string;
  progress: number;
  wpm: number;
  joinTime: Timestamp;
  place: number;
  botConfig?: BotConfig;
};

export type Bot = Player & { targetWpm: number };

export type Game = {
  id: string;
  mode: Mode;
  createdAt: Timestamp;
  players: { [playerId: string]: Player };
  bots: { [botId: string]: Bot };
  phrase: string;
  status: "in_progress" | "waiting";
  botFillTime: Timestamp;
  startTime: Timestamp;
  countdownDuration_s: number;
};

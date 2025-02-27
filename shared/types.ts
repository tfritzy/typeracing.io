export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toMillis: () => number;
}

export type ModeType = LanguageType | PhraseType | ProgrammingLanguage;
export type GroupType = "languages" | "phrases" | "code";

export type LanguageType =
  | "english"
  | "français"
  | "español"
  | "deutsch"
  | "italiano"
  | "português"
  | "dutch"
  | "polski"
  | "русский"
  | "हिंदी";

export type ProgrammingLanguage = "csharp" | "python";
export type PhraseType = "copypastas" | "shakespeare";
export type Formatting = "normal" | "code";

export type Mode = {
  name: string;
  description: string;
  icon: string;
  type: ModeType;
  startupPhrases: string[];
  formatting: Formatting;
};

type BotConfig = {
  wpm: number;
};

export type Player = {
  name: string;
  id: string;
  progress: number;
  wpm: number;
  joinTime: Timestamp;
  place: number;
  botConfig?: BotConfig;
};

export type Bot = Player & { targetWpm: number };

export type Game = {
  createdTime: Timestamp;
  id: string;
  mode: ModeType;
  players: { [playerId: string]: Player };
  bots: { [botId: string]: Bot };
  phrase: string;
  status: "in_progress" | "waiting";
  botFillTime: Timestamp;
  startTime: Timestamp;
};

export interface MonthlyResults {
  year: number;
  month: number;
  results: {
    [day: number]: GameResult[];
  };
}

export interface GameResult {
  game: string;
  mode: ModeType;
  wpm: number;
  place: number;
  length: number;
}

export type PlayerStats = {
  gamesPlayed: number;
  wins: number;
  lastUpdated: Timestamp;
  modeStats: {
    [K in ModeType]?: {
      gamesPlayed: number;
      bestWpm: number;
      totalWpm: number;
      averageWpm: number;
    };
  };
};

export interface GlobalDailyStats {
  gameCounts: { [mode: string]: number };
  playerCounts: { [mode: string]: number };
  totalPlayerCount: number;
}

export interface GlobalYearlyStats {
  year: string;
  days: { [dayOfYear: string]: GlobalDailyStats };
}

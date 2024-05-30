import { createSlice } from "@reduxjs/toolkit";
import {
  ErrorsAtTime,
  GameOver,
  GameStarting,
  PlayerCompleted,
  PlayerDisconnected,
  PlayerJoinedGame,
  WordFinished,
  YouveBeenAddedToGame,
} from "../compiled";

export enum GameStage {
  Invalid,
  WaitingForPlayers,
  Countdown,
  Racing,
  ViewingResults,
  Finished,
}

type PlacementData = {
  playerId: string;
};

export type PlayerData = {
  id: string;
  name: string;
  progress: number;
  velocity_km_s: number;
  position_km: number;
  is_disconnected: boolean;
  themeColor: string;
  final_wpm?: number;
  wpm_by_second?: number[];
  raw_wpm_by_second?: number[];
  most_recent_wpm: number;
  is_bot: boolean;
  accuracy: number;
  errors_at_time: ErrorsAtTime[];
  num_errors: number;
};

export type GameState = {
  state: GameStage;
  id: string;
  players: PlayerData[];
  phrase: string;
  start_time: number;
  end_time: number;
  placements: PlacementData[];
};

const initialGameState: GameState = {
  state: GameStage.Invalid,
  players: [],
  phrase: "",
  id: "",
  start_time: 0,
  end_time: -1,
  placements: [],
};

export const gameSlice = createSlice({
  name: "game",
  initialState: initialGameState,
  reducers: {
    handleGameStarting: (
      state: GameState,
      action: { payload: GameStarting }
    ) => {
      state.state = GameStage.Countdown;
      state.start_time = Date.now() + (action.payload.countdown || 0) * 1000;
    },
    setYouveBeenAddedToGame: (
      state: GameState,
      action: {
        payload: YouveBeenAddedToGame;
      }
    ) => {
      state.id = action.payload.game_id || "";
      state.state = GameStage.WaitingForPlayers;
      state.phrase = action.payload.phrase || "";
      state.players = action.payload.current_players!.map((player) => ({
        id: player.id || "",
        name: player.name || "",
        progress: 0,
        velocity_km_s: 0,
        position_km: 0,
        is_disconnected: false,
        themeColor: "var(--accent)",
        is_bot: player.is_bot || false,
        most_recent_wpm: 0,
        accuracy: 0,
        errors_at_time: [],
        num_errors: 0,
      }));
    },
    updatePlayerWordProgress: (
      state: GameState,
      action: { payload: { id: string; progress: number } }
    ) => {
      const player = state.players.find(
        (player) => player.id === action.payload.id
      );
      if (player) {
        player.progress = action.payload.progress;
      }
    },
    playerJoinedGame: (
      state: GameState,
      action: { payload: PlayerJoinedGame }
    ) => {
      const player: PlayerData = {
        id: action.payload.player?.id || "",
        name: action.payload.player?.name || "",
        progress: 0,
        velocity_km_s: 0,
        position_km: 0,
        is_disconnected: false,
        themeColor: "var(--text-tertiary)",
        is_bot: action.payload.player?.is_bot || false,
        most_recent_wpm: 0,
        accuracy: 0,
        errors_at_time: [],
        num_errors: 0,
      };
      state.players.push(player);
    },
    playerFinished: (
      state: GameState,
      action: { payload: PlayerCompleted }
    ) => {
      const player = state.players.find(
        (p) => p.id === action.payload.player_id
      );

      if (!player) {
        return;
      }

      player.velocity_km_s = 0;
      player.final_wpm = action.payload.wpm || 0;
      player.wpm_by_second = action.payload.wpm_by_second || [];
      player.raw_wpm_by_second = action.payload.raw_wpm_by_second || [];
      player.errors_at_time = action.payload.errors_at_time || [];
      player.accuracy = action.payload.accuracy || 0;
      player.num_errors = action.payload.num_errors || 0;

      if (action.payload.player_id) {
        state.placements[action.payload.place || 0] = {
          playerId: action.payload.player_id,
        };
      }
    },
    playerDisconnected: (
      state: GameState,
      action: { payload: PlayerDisconnected }
    ) => {
      if (action.payload.removed) {
        state.players = state.players.filter(
          (player) => player.id !== action.payload.player_id
        );
      } else {
        const player = state.players.find(
          (player) => player.id === action.payload.player_id
        );
        if (player) {
          player.is_disconnected = true;
        }
      }
    },
    selfFinished: (state: GameState) => {
      state.state = GameStage.ViewingResults;
    },
    setGameStarted: (state: GameState) => {
      state.state = GameStage.Racing;
      state.start_time = Date.now();
    },
    setGameOver: (state: GameState, action: { payload: GameOver }) => {
      state.state = GameStage.Finished;
      state.end_time = action.payload.end_time_s || 0;
    },
    reset: (state: GameState) => {
      Object.assign(state, initialGameState);
    },
    wordFinished: (
      state: GameState,
      action: {
        payload: WordFinished;
      }
    ) => {
      const player = state.players.find(
        (player) => player.id === action.payload.player_id
      );
      if (player) {
        player.progress = action.payload.percent_complete || 0;
        player.velocity_km_s = action.payload.velocity_km_s || 0;
        player.position_km = action.payload.position_km || 0;
        player.most_recent_wpm = action.payload.wpm || 0;
      }
    },
  },
});

export const {
  updatePlayerWordProgress,
  playerDisconnected,
  handleGameStarting,
  setYouveBeenAddedToGame,
  playerFinished,
  selfFinished,
  setGameStarted,
  playerJoinedGame,
  wordFinished,
  setGameOver,
  reset,
} = gameSlice.actions;

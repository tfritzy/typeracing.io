import { createSlice } from "@reduxjs/toolkit";
import { PlayerData } from "../App";

export enum GameStage {
  Invalid,
  WaitingForPlayers,
  Countdown,
  Racing,
  Finished,
}

export type GameState = {
  state: GameStage;
  players: PlayerData[];
  words: string[];
  start_time?: number;
};

const initialGameState: GameState = {
  state: GameStage.Invalid,
  players: [],
  words: [],
  start_time: undefined,
};

export const gameSlice = createSlice({
  name: "game",
  initialState: initialGameState,
  reducers: {
    setGameStarting: (
      state: GameState,
      action: {
        payload: {
          words: string[];
          countdown: number;
          stage: GameStage;
        };
      }
    ) => {
      state.state = GameStage.Countdown;
      state.words = action.payload.words;
      state.start_time = Date.now() + action.payload.countdown * 1000;
    },
    setYouveBeenAddedToGame: (
      state: GameState,
      action: {
        payload: {
          players: PlayerData[];
          words: string[];
        };
      }
    ) => {
      state.state = GameStage.WaitingForPlayers;
      state.players = action.payload.players;
      state.words = action.payload.words;
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
    addPlayer: (state: GameState, action: { payload: PlayerData }) => {
      state.players.push(action.payload);
    },
    wordFinished: (
      state: GameState,
      action: {
        payload: {
          id: string;
          progress: number;
          velocity_km_s: number;
          position_km: number;
        };
      }
    ) => {
      const player = state.players.find(
        (player) => player.id === action.payload.id
      );
      if (player) {
        player.progress = action.payload.progress;
        player.velocity_km_s = action.payload.velocity_km_s;
        player.position_km = action.payload.position_km;
      }
    },
  },
});

export const {
  updatePlayerWordProgress,
  setGameStarting,
  setYouveBeenAddedToGame,
  addPlayer,
  wordFinished,
} = gameSlice.actions;

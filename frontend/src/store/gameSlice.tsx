import { createSlice } from "@reduxjs/toolkit";
import { PlayerData } from "../App";
import {
  GameOver,
  PlayerCompleted,
  PlayerDisconnected,
  PlayerJoinedGame,
  WordFinished,
  YouveBeenAddedToGame,
} from "../compiled";
import { getColorForPlayer } from "../helpers/getColor";

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

export type GameState = {
  state: GameStage;
  players: PlayerData[];
  phrase: string;
  start_time: number;
  race_start_time: number;
  end_time: number;
  placements: PlacementData[];
};

const initialGameState: GameState = {
  state: GameStage.Invalid,
  players: [],
  phrase: "",
  start_time: -1,
  race_start_time: -1,
  end_time: -1,
  placements: [],
};

export const gameSlice = createSlice({
  name: "game",
  initialState: initialGameState,
  reducers: {
    setGameStarting: (
      state: GameState,
      action: {
        payload: {
          phrase: string;
          countdown: number;
          stage: GameStage;
        };
      }
    ) => {
      state.state = GameStage.Countdown;
      state.phrase = action.payload.phrase;
      state.start_time = Date.now() + action.payload.countdown * 1000;
    },
    setYouveBeenAddedToGame: (
      state: GameState,
      action: {
        payload: YouveBeenAddedToGame;
      }
    ) => {
      state.state = GameStage.WaitingForPlayers;
      state.players = action.payload.current_players!.map((player) => ({
        id: player.id || "",
        name: player.name || "",
        progress: 0,
        velocity_km_s: 0,
        position_km: 0,
        is_disconnected: false,
        themeColor: getColorForPlayer(player.id || ""),
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
        id: action.payload.player_id || "",
        name: action.payload.player_name || "",
        progress: 0,
        velocity_km_s: 0,
        position_km: 0,
        is_disconnected: false,
        themeColor: getColorForPlayer(action.payload.player_id || ""),
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

      console.log("Player finished", player);

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
      state.race_start_time = Date.now();
    },
    setGameOver: (state: GameState, action: { payload: GameOver }) => {
      state.state = GameStage.Finished;
      state.end_time = action.payload.end_time_s || 0;
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
      }
    },
  },
});

export const {
  updatePlayerWordProgress,
  playerDisconnected,
  setGameStarting,
  setYouveBeenAddedToGame,
  playerFinished,
  selfFinished,
  setGameStarted,
  playerJoinedGame,
  wordFinished,
  setGameOver,
} = gameSlice.actions;

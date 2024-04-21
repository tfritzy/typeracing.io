import { createSlice } from "@reduxjs/toolkit";
import { PlayerData } from "../App";
import {
 GameOver,
 PlayerCompleted,
 PlayerJoinedGame,
 WordFinished,
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

export type GameState = {
 state: GameStage;
 players: PlayerData[];
 words: string[];
 start_time: number;
 end_time: number;
 placements: PlacementData[];
};

const initialGameState: GameState = {
 state: GameStage.Invalid,
 players: [],
 words: [],
 start_time: -1,
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
     words: string[];
     countdown: number;
     stage: GameStage;
    };
   }
  ) => {
   state.state = GameStage.Countdown;
   state.words = action.payload.words;
   state.start_time =
    Date.now() + action.payload.countdown * 1000;
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
  playerJoinedGame: (
   state: GameState,
   action: { payload: PlayerJoinedGame }
  ) => {
   const player = {
    id: action.payload.player_id || "",
    name: action.payload.player_name || "",
    progress: 0,
    velocity_km_s: 0,
    position_km: 0,
    wordCompletionTimes: [],
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

   if (action.payload.player_id) {
    state.placements[action.payload.place || 0] = {
     playerId: action.payload.player_id,
    };
   }
  },
  selfFinished: (state: GameState) => {
   state.state = GameStage.ViewingResults;
  },
  setGameStarted: (state: GameState) => {
   state.state = GameStage.Racing;
  },
  setGameOver: (
   state: GameState,
   action: { payload: GameOver }
  ) => {
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
    player.velocity_km_s =
     action.payload.velocity_km_s || 0;
    player.position_km = action.payload.position_km || 0;
    player.wordCompletionTimes.push(
     action.payload.time_s || 0
    );
   }
  },
 },
});

export const {
 updatePlayerWordProgress,
 setGameStarting,
 setYouveBeenAddedToGame,
 playerFinished,
 selfFinished,
 setGameStarted,
 playerJoinedGame,
 wordFinished,
 setGameOver,
} = gameSlice.actions;

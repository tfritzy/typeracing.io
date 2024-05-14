import { createSlice } from "@reduxjs/toolkit";
import { GameMode } from "../compiled";

export type GameType = "Multiplayer" | "Practice";

export type PlayerState = {
  name: string;
  id: string;
  token: string;
  gameMode: GameMode;
  gameType: GameType;
  raceResults: RaceResult[];
};

const initalState: PlayerState = {
  name: "",
  id: "",
  token: "",
  gameMode: GameMode.Common,
  gameType: "Multiplayer",
  raceResults: [],
};

export type RaceResult = {
  wpm: number;
  accuracy: number;
  mode: GameMode;
  time: number;
};

export const playerSlice = createSlice({
  name: "player",
  initialState: initalState,
  reducers: {
    updatePlayerName: (state: PlayerState, action: { payload: string }) => {
      state.name = action.payload;
    },
    updatePlayerId: (state: PlayerState, action: { payload: string }) => {
      state.id = action.payload;
    },
    updateToken: (state: PlayerState, action: { payload: string }) => {
      state.token = action.payload;
    },
    setGameType: (state: PlayerState, action: { payload: GameType }) => {
      state.gameType = action.payload;
    },
    addRaceResult: (state: PlayerState, action: { payload: RaceResult }) => {
      state.raceResults.push(action.payload);
    },
    setRaceResults: (state: PlayerState, action: { payload: RaceResult[] }) => {
      state.raceResults = action.payload;
    },
    setMode: (state: PlayerState, action: { payload: GameMode }) => {
      state.gameMode = action.payload;
    },
  },
});

export const {
  updatePlayerId,
  updateToken,
  updatePlayerName,
  addRaceResult,
  setRaceResults,
  setGameType,
  setMode,
} = playerSlice.actions;

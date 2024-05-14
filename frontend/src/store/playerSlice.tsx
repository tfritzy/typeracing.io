import { createSlice } from "@reduxjs/toolkit";
import { GameMode } from "../compiled";

type GameType = "Multiplayer" | "Practice";

export type PlayerState = {
 name: string;
 id: string;
 token: string;
 enabledModes: GameMode[];
 gameType: GameType;
};

const initalState: PlayerState = {
 name: "",
 id: "",
 token: "",
 enabledModes: [GameMode.Common],
 gameType: "Multiplayer",
};

export const playerSlice = createSlice({
 name: "player",
 initialState: initalState,
 reducers: {
  updatePlayerName: (
   state: PlayerState,
   action: { payload: string }
  ) => {
   state.name = action.payload;
  },
  updatePlayerId: (
   state: PlayerState,
   action: { payload: string }
  ) => {
   state.id = action.payload;
  },
  updateToken: (
   state: PlayerState,
   action: { payload: string }
  ) => {
   state.token = action.payload;
  },
  setGameType: (
   state: PlayerState,
   action: { payload: GameType }
  ) => {
   state.gameType = action.payload;
  },
  setModeEnabled: (
   state: PlayerState,
   action: { payload: { mode: GameMode; enabled: boolean } }
  ) => {
   if (action.payload.enabled) {
    state.enabledModes.push(action.payload.mode);
   } else {
    state.enabledModes = state.enabledModes.filter(
     (mode) => mode !== action.payload.mode
    );
   }
  },
 },
});

export const {
 updatePlayerId,
 updateToken,
 updatePlayerName,
 setGameType,
 setModeEnabled,
} = playerSlice.actions;

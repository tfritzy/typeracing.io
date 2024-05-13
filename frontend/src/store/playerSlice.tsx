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
  updatePlayer: (state: PlayerState, action) => {
   state.name = action.payload.name;
   state.id = action.payload.id;
   state.token = action.payload.token;
  },
  updatePlayerName: (state: PlayerState, action) => {
   state.name = action.payload;
  },
  setGameType: (state: PlayerState, action) => {
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
 updatePlayer,
 updatePlayerName,
 setGameType,
 setModeEnabled,
} = playerSlice.actions;

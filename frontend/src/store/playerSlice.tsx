import { createSlice } from "@reduxjs/toolkit";

export type PlayerState = {
 name: string;
 id: string;
 token: string;
};

const initalState: PlayerState = {
 name: "",
 id: "",
 token: "",
};

export const playerSlice = createSlice({
 name: "player",
 initialState: initalState,
 reducers: {
  updatePlayer: (state, action) => {
   state.name = action.payload.name;
   state.id = action.payload.id;
   state.token = action.payload.token;
  },
  updatePlayerName: (state, action) => {
   state.name = action.payload;
  },
 },
});

export const { updatePlayer, updatePlayerName } =
 playerSlice.actions;

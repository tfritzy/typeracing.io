import { configureStore } from "@reduxjs/toolkit";
import { gameSlice } from "./gameSlice";

export const gameStore = configureStore({
  reducer: {
    game: gameSlice.reducer,
  },
});

export type GameStoreState = ReturnType<typeof gameStore.getState>;
export type GameStoreDispatch = typeof gameStore.dispatch;

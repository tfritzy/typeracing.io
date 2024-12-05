import { InGame } from "./InGame";
import { ConnectionProvider } from "../ConnectionProvider";
import { StoreProvider } from "../store/CustomProvider";
import { gameStore } from "../store/gameStore";
import { GameContext, useGameDispatch } from "../store/storeHooks";
import { useEffect } from "react";
import { reset } from "../store/gameSlice";

export function Game() {
  return (
    <ConnectionProvider>
      <StoreProvider store={gameStore} context={GameContext}>
        <InGame />
      </StoreProvider>
    </ConnectionProvider>
  );
}

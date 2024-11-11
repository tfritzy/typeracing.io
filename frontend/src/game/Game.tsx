import { InGame } from "./InGame";
import { ConnectionProvider } from "../ConnectionProvider";
import { StoreProvider } from "../store/CustomProvider";
import { gameStore } from "../store/gameStore";
import { GameContext } from "../store/storeHooks";

export function Game() {
  return (
    <ConnectionProvider>
      <StoreProvider store={gameStore} context={GameContext}>
        <InGame />
      </StoreProvider>
    </ConnectionProvider>
  );
}

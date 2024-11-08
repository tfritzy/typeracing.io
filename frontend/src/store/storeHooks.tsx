import { createContext } from "react";
import { createSelectorHook, createDispatchHook } from "react-redux";

export const AppContext = createContext<any>(null);
export const useAppSelector = createSelectorHook(AppContext);
export const useAppDispatch = createDispatchHook(AppContext);

export const GameContext = createContext<any>(null);
export const useGameSelector = createSelectorHook(GameContext);
export const useGameDispatch = createDispatchHook(GameContext);

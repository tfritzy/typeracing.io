import { NavigateFunction } from "react-router-dom";
import { FindGameRequest, OneofRequest } from "../compiled";
import { PlayerState } from "../store/playerSlice";
import { Dispatch } from "redux";
import { reset } from "../store/gameSlice";

export const sendFindGameRequest = (
  sendRequest: (request: OneofRequest) => void,
  player: PlayerState
) => {
  const findGame: FindGameRequest = {
    player_name: player.name,
    game_modes: [player.gameMode],
    private_game: player.gameType === "Practice",
  };
  const request: OneofRequest = {
    sender_id: player.id,
    sender_token: player.token,
    find_game: findGame,
  };

  sendRequest(request);
};

export const returnToMainMenu = (
  navigate: NavigateFunction,
  dispatch: Dispatch
) => {
  navigate("/");
  dispatch(reset());
};

export const computeWpm = (charCount: number, time_s: number): number => {
  return ((charCount / time_s) * 60) / 5;
};

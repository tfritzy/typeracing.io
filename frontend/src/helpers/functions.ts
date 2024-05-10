import {
 FindGameRequest,
 OneofRequest,
 encodeOneofRequest,
} from "../compiled";
import { PlayerState } from "../store/playerSlice";

export const sendFindGameRequest = (
 sendRequest: (request: ArrayBuffer) => void,
 player: PlayerState
) => {
 const findGame: FindGameRequest = {
  player_name: player.name,
  player_token: player.token,
  game_modes: player.enabledModes,
 };
 const request: OneofRequest = {
  sender_id: player.id,
  find_game: findGame,
 };

 sendRequest(encodeOneofRequest(request));
};

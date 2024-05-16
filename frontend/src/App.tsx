import React from "react";
import { GameMode, decodeOneofUpdate } from "./compiled";
import { InGame } from "./InGame";
import { useDispatch, useSelector } from "react-redux";
import {
  handleGameStarting,
  setYouveBeenAddedToGame,
  playerJoinedGame,
  wordFinished,
  setGameStarted,
  playerFinished,
  selfFinished,
  setGameOver,
  playerDisconnected,
} from "./store/gameSlice";
import { generateRandomName } from "./generateRandomName";
import {
  addRaceResult,
  setRaceResults,
  updatePlayerId,
  updatePlayerName,
  updateToken,
} from "./store/playerSlice";
import { MainMenu } from "./MainMenu";
import { NavigateFunction, Route, Routes, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { storeRaceResultInCookies } from "./helpers/raceResults";
import { RootState } from "./store/store";
import { Dispatch } from "redux";

export type PlayerData = {
  id: string;
  name: string;
  progress: number;
  velocity_km_s: number;
  position_km: number;
  is_disconnected: boolean;
  themeColor: string;
  final_wpm?: number;
  wpm_by_second?: number[];
  raw_wpm_by_second?: number[];
  most_recent_wpm: number;
  is_bot: boolean;
};

const handleMessage = (
  event: MessageEvent<any>,
  dispatch: Dispatch,
  navigate: NavigateFunction,
  playerId: string,
  gameId: string
) => {
  if (event.data === null) {
  } else if (event.data instanceof Blob) {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        const buffer = new Uint8Array(reader.result);
        const update = decodeOneofUpdate(buffer);

        if (update.youve_been_added_to_game != null) {
          dispatch(setYouveBeenAddedToGame(update.youve_been_added_to_game));
          navigate(`/${update.youve_been_added_to_game.game_id}`);
        }

        if (update.game_id !== gameId) {
          console.log("#notmygame", update.game_id, gameId);
          return;
        }

        if (update.game_starting) {
          dispatch(handleGameStarting(update.game_starting));
        } else if (update.player_joined_game) {
          dispatch(playerJoinedGame(update.player_joined_game));
        } else if (update.game_started) {
          dispatch(setGameStarted());
        } else if (update.game_over) {
          dispatch(setGameOver(update.game_over));
        } else if (update.player_disconnected) {
          dispatch(playerDisconnected(update.player_disconnected));
        } else if (update.player_completed) {
          dispatch(playerFinished(update.player_completed));
          if (update.player_completed.player_id === playerId) {
            dispatch(selfFinished());
            const raceResult = {
              accuracy: update.player_completed.accuracy || 0,
              mode: update.player_completed.mode || GameMode.Invalid,
              time: Date.now(),
              wpm: update.player_completed.wpm || 0,
            };
            storeRaceResultInCookies(raceResult);
            dispatch(addRaceResult(raceResult));
          }
        } else if (update.word_finished) {
          dispatch(wordFinished(update.word_finished));
        }
      }
    };
    reader.readAsArrayBuffer(event.data);
  }
};

function App() {
  const playerId = useSelector((state: RootState) => state.player.id);
  const gameId = useSelector((state: RootState) => state.game.id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [ws, setWs] = React.useState<WebSocket | null>(null);

  React.useEffect(() => {
    let name = Cookies.get("name");
    if (!name) {
      name = generateRandomName();
      Cookies.set("name", name, {
        sameSite: "strict",
        expires: 3650,
      });
    }

    let playerId = Cookies.get("playerId");
    if (!playerId) {
      playerId = "plyr_" + Math.random().toString(36).substring(7);
      Cookies.set("playerId", playerId, {
        sameSite: "strict",
        expires: 3650,
      });
    }

    let token = Cookies.get("token");
    if (!token) {
      token = "tkn_" + Math.random().toString(36).substring(7);
      Cookies.set("token", token, {
        sameSite: "strict",
        expires: 3650,
      });
    }

    let raceResults = Cookies.get("raceResults");
    if (raceResults) {
      dispatch(setRaceResults(JSON.parse(raceResults)));
    }

    dispatch(updatePlayerName(name));
    dispatch(updatePlayerId(playerId));
    dispatch(updateToken(token));

    var ws = new WebSocket(`ws://localhost:5000/?id=${playerId}`);
    ws.onopen = () => {};
    ws.onmessage = (event) =>
      handleMessage(event, dispatch, navigate, playerId || "", gameId);
    ws.onclose = () => {
      console.log("Disconnected");
    };
    setWs(ws);
    return () => {
      ws.close();
    };
  }, []);

  React.useEffect(() => {
    if (!ws) {
      return;
    }

    ws.onmessage = (event) =>
      handleMessage(event, dispatch, navigate, playerId, gameId);
  }, [dispatch, gameId, navigate, playerId, ws]);

  const sendRequest = React.useCallback(
    (request: ArrayBuffer) => {
      if (ws) {
        ws.send(request);
      }
    },
    [ws]
  );

  // Global hotkeys
  React.useEffect(() => {
    const handleHotkeys = (event: KeyboardEvent) => {
      if (event.key === "t") {
        const element = document.getElementById("type-box");
        if (document.activeElement !== element) {
          element?.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleHotkeys);

    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<MainMenu sendRequest={sendRequest} />} />
      <Route path="/:gameId" element={<InGame sendRequest={sendRequest} />} />
    </Routes>
  );
}

export default App;

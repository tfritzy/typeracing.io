import React, { useEffect } from "react";
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
  reset,
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
import { saveRaceResult } from "./helpers/raceResults";
import { RootState } from "./store/store";
import { Dispatch } from "redux";
import { DisconnectedModal } from "./DisconnectedModal";

const serverUrl = process.env.REACT_APP_SERVER_ADDRESS;

const handleMessage = (
  event: MessageEvent<any>,
  dispatch: Dispatch,
  navigate: NavigateFunction,
  playerId: string,
  gameRef: React.MutableRefObject<string>
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
          if (gameRef.current) {
            gameRef.current = update.youve_been_added_to_game.game_id || "";
          }
        }

        if (update.game_id !== gameRef.current) {
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
          if (!update.player_disconnected.is_you) {
            dispatch(playerDisconnected(update.player_disconnected));
          } else {
            dispatch(reset());
            navigate("/", { replace: true });
          }
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
            saveRaceResult(raceResult);
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
  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <h2>Sorry out of service for a while.</h2>
      <p>This is self hosted, and I'm moving. Will be back soon :(</p>
    </div>
  );

  const gameRef = React.useRef<string>("");
  const playerId = useSelector((state: RootState) => state.player.id);
  const gameId = useSelector((state: RootState) => state.game.id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const [wsState, setWsState] = React.useState<WebSocket["readyState"]>(
    WebSocket.CONNECTING
  );

  useEffect(() => {
    if (gameId) {
      gameRef.current = gameId;
    }
  }, [gameId]);

  const connect = React.useCallback(() => {
    setWsState(WebSocket.CONNECTING);
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

    let raceResults = localStorage.getItem("raceResults");
    if (raceResults) {
      dispatch(setRaceResults(JSON.parse(raceResults)));
    }

    dispatch(updatePlayerName(name));
    dispatch(updatePlayerId(playerId));
    dispatch(updateToken(token));

    var ws = new WebSocket(`${serverUrl}/?id=${playerId}`);
    ws.onopen = () => {
      setWsState(WebSocket.OPEN);
    };
    ws.onmessage = (event) =>
      handleMessage(event, dispatch, navigate, playerId || "", gameRef);
    ws.onclose = () => {
      setWsState(WebSocket.CLOSED);
    };
    setWs(ws);
    return () => {
      ws.close();
    };
  }, [dispatch, navigate]);

  React.useEffect(() => connect(), []);

  React.useEffect(() => {
    if (!ws) {
      return;
    }

    ws.onmessage = (event) =>
      handleMessage(event, dispatch, navigate, playerId, gameRef);
  }, [dispatch, navigate, playerId, ws]);

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
        if (
          document.activeElement !== element &&
          document.activeElement?.tagName !== "INPUT"
        ) {
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

  if (wsState === WebSocket.CONNECTING) {
    return null;
  }

  if (wsState === WebSocket.CLOSED) {
    return <DisconnectedModal reconnect={connect} />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainMenu sendRequest={sendRequest} />} />
      <Route path="/:gameId" element={<InGame sendRequest={sendRequest} />} />
    </Routes>
  );
}

export default App;

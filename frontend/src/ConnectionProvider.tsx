import React, { createContext, useContext, ReactNode } from "react";
import { addRaceResult, PlayerState } from "./store/playerSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { decodeOneofUpdate, GameMode } from "./compiled";
import {
 handleGameStarting,
 playerDisconnected,
 playerFinished,
 playerJoinedGame,
 reset,
 selfFinished,
 setGameOver,
 setGameStarted,
 setYouveBeenAddedToGame,
 wordFinished,
} from "./store/gameSlice";
import { saveRaceResult } from "./helpers/raceResults";
import { Dispatch } from "redux";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { DisconnectedModal } from "./DisconnectedModal";
import { LoadingSpinner } from "./LoadingSpinner";

const apiUrl = process.env.REACT_APP_API_ADDRESS;

interface ContextState {
 sendRequest: (request: ArrayBuffer) => void;
}

const ConnectionContext = createContext<ContextState | undefined>(undefined);

export const useConnectionContext = () => {
 const context = useContext(ConnectionContext);
 if (context === undefined) {
  throw new Error("useAppContext must be used within an AppProvider");
 }
 return context;
};

interface ConnectionProviderProps {
 children: ReactNode;
}

const handleMessage = (
 event: MessageEvent<any>,
 dispatch: Dispatch,
 navigate: NavigateFunction,
 playerId: string,
 currentGameId: string
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
    }

    if (update.game_id !== currentGameId) {
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

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({
 children,
}) => {
 const [ws, setWs] = React.useState<WebSocket | null>(null);
 const [wsState, setWsState] = React.useState<WebSocket["readyState"]>(
  WebSocket.CONNECTING
 );
 const dispatch = useDispatch();
 const player: PlayerState = useSelector((state: RootState) => state.player);
 const navigate = useNavigate();
 const gameId = useSelector((state: RootState) => state.game.id);

 const connect = React.useCallback(() => {
  setWsState(WebSocket.CONNECTING);
  fetch(apiUrl + "/api/find-host")
   .then((response) => response.json())
   .then((data) => {
    var ws = new WebSocket(`${data.url}/?id=${player.id}`);
    ws.onopen = () => {
     setWsState(WebSocket.OPEN);
     const loader = document.getElementById("initial-loader");
     if (loader) {
      loader.remove();
     }
    };
    ws.onmessage = (event) =>
     handleMessage(event, navigate, dispatch, player.id || "", gameId);
    ws.onclose = () => {
     setWsState(WebSocket.CLOSED);
    };
    setWs(ws);
   })
   .catch((error) => {
    console.error("Error finding host:", error);
    setWsState(WebSocket.CLOSED);
   });
 }, [dispatch, gameId, navigate, player.id]);

 React.useEffect(() => connect(), []);

 const sendRequest = React.useCallback(
  (request: ArrayBuffer) => {
   if (ws) {
    ws.send(request);
   }
  },
  [ws]
 );

 if (wsState === WebSocket.CLOSED) {
  return <DisconnectedModal reconnect={connect} />;
 }

 if (wsState !== WebSocket.OPEN) {
  return <LoadingSpinner />;
 }

 const value: ContextState = {
  sendRequest,
 };

 return (
  <ConnectionContext.Provider value={value}>
   {children}
  </ConnectionContext.Provider>
 );
};

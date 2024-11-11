import React, { createContext, useContext, ReactNode } from "react";
import { PlayerState } from "./store/playerSlice";
import { RootState } from "./store/store";
import { encodeOneofRequest, OneofRequest } from "./compiled";
import { DisconnectedModal } from "./DisconnectedModal";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useAppSelector } from "./store/storeHooks";

const apiUrl = process.env.REACT_APP_API_ADDRESS;

interface ContextState {
  ws: WebSocket;
  sendRequest: (request: OneofRequest) => void;
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

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({
  children,
}) => {
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const [wsState, setWsState] = React.useState<WebSocket["readyState"]>(
    WebSocket.CONNECTING
  );
  const player: PlayerState = useAppSelector(
    (state: RootState) => state.player
  );

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
        ws.onclose = () => {
          setWsState(WebSocket.CLOSED);
        };
        setWs(ws);
      })
      .catch((error) => {
        console.error("Error finding host:", error);
        setWsState(WebSocket.CLOSED);
      });
  }, [player.id]);

  React.useEffect(() => {
    if (player.id) {
      connect();
    }
  }, [connect, player.id]);

  const sendRequest = React.useCallback(
    (request: OneofRequest) => {
      if (ws) {
        ws.send(encodeOneofRequest(request));
      }
    },
    [ws]
  );

  if (wsState === WebSocket.CLOSED) {
    return <DisconnectedModal reconnect={connect} />;
  }

  if (!ws || wsState !== WebSocket.OPEN) {
    return <LoadingSpinner />;
  }

  const value: ContextState = {
    ws,
    sendRequest,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

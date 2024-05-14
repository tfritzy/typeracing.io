import React from "react";
import { decodeOneofUpdate } from "./compiled";
import { InGame } from "./InGame";
import { useDispatch } from "react-redux";
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
 updatePlayerId,
 updatePlayerName,
 updateToken,
} from "./store/playerSlice";
import { MainMenu } from "./MainMenu";
import {
 Route,
 Routes,
 useNavigate,
} from "react-router-dom";
import Cookies from "js-cookie";

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

function App() {
 const navigate = useNavigate();
 const dispatch = useDispatch();
 const [ws, setWs] = React.useState<WebSocket | null>(null);

 React.useEffect(() => {
  let name = Cookies.get("name");
  if (!name) {
   name = generateRandomName();
   Cookies.set("name", name);
  }

  let playerId = Cookies.get("playerId");
  if (!playerId) {
   playerId =
    "plyr_" + Math.random().toString(36).substring(7);
   Cookies.set("playerId", playerId);
  }

  let token = Cookies.get("token");
  if (!token) {
   token = "tkn_" + Math.random().toString(36).substring(7);
   Cookies.set("token", token);
  }

  dispatch(updatePlayerName(name));
  dispatch(updatePlayerId(playerId));
  dispatch(updateToken(token));

  var ws = new WebSocket(
   `ws://localhost:5000/?id=${playerId}`
  );
  ws.onopen = () => {};
  ws.onmessage = (event) => {
   if (event.data === null) {
   } else if (event.data instanceof Blob) {
    const reader = new FileReader();
    reader.onload = () => {
     if (reader.result instanceof ArrayBuffer) {
      const buffer = new Uint8Array(reader.result);
      const update = decodeOneofUpdate(buffer);

      if (update.game_starting) {
       dispatch(handleGameStarting(update.game_starting));
      } else if (update.youve_been_added_to_game != null) {
       dispatch(
        setYouveBeenAddedToGame(
         update.youve_been_added_to_game
        )
       );
       navigate(
        `/${update.youve_been_added_to_game.game_id}`
       );
      } else if (update.player_joined_game) {
       dispatch(
        playerJoinedGame(update.player_joined_game)
       );
      } else if (update.game_started) {
       dispatch(setGameStarted());
      } else if (update.game_over) {
       dispatch(setGameOver(update.game_over));
      } else if (update.player_disconnected) {
       dispatch(
        playerDisconnected(update.player_disconnected)
       );
      } else if (update.player_completed) {
       dispatch(playerFinished(update.player_completed));
       if (update.player_completed.player_id === playerId) {
        dispatch(selfFinished());
       }
      } else if (update.word_finished) {
       dispatch(wordFinished(update.word_finished));
      }
     }
    };
    reader.readAsArrayBuffer(event.data);
   }
  };
  ws.onclose = () => {
   console.log("Disconnected");
  };
  setWs(ws);
  return () => {
   ws.close();
  };
 }, []);

 const sendRequest = React.useCallback(
  (request: ArrayBuffer) => {
   if (ws) {
    ws.send(request);
   }
  },
  [ws]
 );

 return (
  <Routes>
   <Route
    path="/"
    element={<MainMenu sendRequest={sendRequest} />}
   />
   <Route
    path="/:gameId"
    element={<InGame sendRequest={sendRequest} />}
   />
  </Routes>
 );

 //  return (
 //   <div className="w-screen h-screen">
 //    <div
 //     className="font-thin center-column"
 //     style={{ color: TextColor }}
 //    >
 //     {content}
 //    </div>
 //   </div>
 //  );
}

export default App;

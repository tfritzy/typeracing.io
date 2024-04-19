import React from "react";
import { decodeOneofUpdate } from "./compiled";
import { HomeScreen } from "./HomeScreen";
import { InGame } from "./InGame";
import { useDispatch } from "react-redux";
import {
 GameStage,
 setGameStarting,
 setYouveBeenAddedToGame,
 playerJoinedGame,
 wordFinished,
 setGameStarted,
 playerFinished,
 selfFinished,
} from "./store/gameSlice";
import { generateRandomName } from "./generateRandomName";
import { updatePlayer } from "./store/playerSlice";
import Stars from "./StarsV2";
import { BackgroundColor } from "./constants";

export type PlayerData = {
 id: string;
 name: string;
 progress: number;
 velocity_km_s: number;
 position_km: number;
};

enum State {
 Menu,
 InGame,
}

function App() {
 const dispatch = useDispatch();
 const [state, setState] = React.useState<State>(
  State.Menu
 );
 const [ws, setWs] = React.useState<WebSocket | null>(null);

 React.useEffect(() => {
  const token =
   "tkn_" + Math.random().toString(36).substring(7);
  const playerId =
   "plyr_" + Math.random().toString(36).substring(7);

  dispatch(
   updatePlayer({
    token: token,
    name: generateRandomName(),
    id: playerId,
   })
  );

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
       const words = update.game_starting.phrase
        ?.trim()
        ?.split(" ");

       dispatch(
        setGameStarting({
         stage: GameStage.Countdown,
         words: words || [],
         countdown: update.game_starting.countdown || 0,
        })
       );
      } else if (update.youve_been_added_to_game != null) {
       setState(State.InGame);
       dispatch(
        setYouveBeenAddedToGame({
         players:
          update.youve_been_added_to_game.current_players?.map(
           (player) => ({
            id: player.id || "<unknown>",
            name: player.name || "<unknown>",
            progress: 0,
            velocity_km_s: 0,
            position_km: 0,
           })
          ) || [],
         words: [],
        })
       );
      } else if (update.player_joined_game) {
       dispatch(
        playerJoinedGame(update.player_joined_game)
       );
      } else if (update.game_started) {
       dispatch(setGameStarted());
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

 let content;
 if (state === State.Menu) {
  content = <HomeScreen sendRequest={sendRequest} />;
 } else {
  content = <InGame sendRequest={sendRequest} />;
 }

 return (
  <div
   className="App"
   style={{ backgroundColor: BackgroundColor }}
  >
   {content}
   {/* <Stars /> */}
  </div>
 );
}

export default App;

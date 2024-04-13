import React from "react";
import { decodeOneofUpdate } from "./compiled";
import { Stars } from "./Stars";
import { HomeScreen } from "./HomeScreen";
import { InGame } from "./InGame";
import { useDispatch } from "react-redux";
import {
 GameStage,
 setGameStarting,
 setYouveBeenAddedToGame,
 addPlayer,
 wordFinished,
} from "./store/gameSlice";
import { generateRandomName } from "./generateRandomName";
import { updatePlayer } from "./store/playerSlice";
import ElongatedCircle from "./StarsV2";

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
   `ws://localhost:5000/?token=${token}`
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
       const words =
        update.game_starting.phrase?.split(" ");

       dispatch(
        setGameStarting({
         stage: GameStage.Countdown,
         words: words || [],
         countdown: 3,
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
        addPlayer({
         id: update.player_joined_game.player_id || "",
         name: update.player_joined_game.player_name || "",
         progress: 0,
         velocity_km_s: 0,
         position_km: 0,
        })
       );
      } else if (update.word_finished) {
       dispatch(
        wordFinished({
         id: update.word_finished.player_id || "",
         progress:
          update.word_finished.percent_complete || 0,
         velocity_km_s:
          update.word_finished.velocity_km_s || 0,
         position_km: update.word_finished.position_km || 0,
        })
       );
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

 let content;
 if (state === State.Menu) {
  content = (
   <HomeScreen
    sendRequest={(request) => {
     if (ws) {
      ws.send(request);
     }
    }}
   />
  );
 } else {
  content = (
   <InGame
    sendRequest={(request) => {
     if (ws) {
      ws.send(request);
     }
    }}
   />
  );
 }

 return (
  <div className="App">
   {/* {content} */}
   <ElongatedCircle />
   {/* <Stars /> */}
  </div>
 );
}

export default App;

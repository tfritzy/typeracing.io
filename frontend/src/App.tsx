import React from "react";
import { decodeOneofUpdate } from "./compiled";
import { Stars } from "./Stars";
import { MainMenu } from "./MainMenu";
import { InGame } from "./InGame";
import { useDispatch } from "react-redux";
import {
 GameStage,
 setGameStarting,
 setYouveBeenAddedToGame,
 addPlayer,
 wordFinished,
} from "./store/gameSlice";

export type PlayerData = {
 id: string;
 name: string;
 progress: number;
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
 const [token, setToken] = React.useState<string>("");
 const [playerName, setPlayerName] =
  React.useState<string>("");

 React.useEffect(() => {
  const token =
   "tkn_" + Math.random().toString(36).substring(7);
  setToken(token);
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
        })
       );
      } else if (update.word_finished) {
       dispatch(
        wordFinished({
         id: update.word_finished.player_id || "",
         progress:
          update.word_finished.percent_complete || 0,
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
   <MainMenu
    token={token}
    playerName={playerName}
    setPlayerName={setPlayerName}
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
    token={token}
   />
  );
 }

 return (
  <div className="App">
   {content}
   <Stars />
  </div>
 );
}

export default App;

import React from "react";
import "./App.css";
import {
 decodeOneofUpdate,
 Player as PlayerType,
} from "./compiled";
import { Stars } from "./Stars";
import { StartGame } from "./StartGame";
import { InGame } from "./InGame";

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
 const [state, setState] = React.useState<State>(
  State.Menu
 );
 const [ws, setWs] = React.useState<WebSocket | null>(null);
 const [token, setToken] = React.useState<string>("");
 const [words, setWords] = React.useState<string[]>([]);
 const [playerName, setPlayerName] =
  React.useState<string>("");
 const [players, setPlayers] = React.useState<PlayerData[]>(
  []
 );

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
       setWords(
        (update.game_starting.phrase || "").split(" ")
       );
      } else if (update.youve_been_added_to_game != null) {
       setState(State.InGame);
       setPlayers(
        (
         update.youve_been_added_to_game.current_players ||
         []
        ).map((player: PlayerType) => ({
         id: player.id || "<unknown>",
         name: player.name || "<unknown>",
         progress: 0,
        }))
       );
      } else if (update.player_joined_game) {
       setPlayers((players) => [
        ...players,
        {
         id:
          update.player_joined_game?.player_id ||
          "<unknown>",
         name:
          update.player_joined_game?.player_name ||
          "<unknown>",
         progress: 0,
        },
       ]);
      } else if (update.word_finished) {
       setPlayers((players) =>
        players.map((player) =>
         player.id === update.word_finished?.player_id
          ? {
             id: player.id,
             name: player.name,
             progress:
              update.word_finished.percent_complete || 0,
            }
          : player
        )
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
   <StartGame
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
    words={words}
    token={token}
    players={players}
    setPlayers={setPlayers}
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

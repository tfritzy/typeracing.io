import React from "react";
import "./App.css";
import {
 FindGameRequest,
 OneofRequest,
 encodeOneofRequest,
 decodeOneofUpdate,
 Player as PlayerType,
} from "./compiled";
import { Stars } from "./Stars";
import { TypeBox } from "./TypeBox";
import { Player } from "./Player";

type PlayerData = {
 id: string;
 name: string;
 progress: number;
};

function App() {
 const [ws, setWs] = React.useState<WebSocket | null>(null);
 const [token, setToken] = React.useState<string>("");
 const [words, setWords] = React.useState<string[]>([]);
 const [playerName, setPlayerName] =
  React.useState<string>("");
 const [wordIndex, setWordIndex] =
  React.useState<number>(0);
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
  ws.onopen = () => {
   console.log("Connected");
  };
  ws.onmessage = (event) => {
   if (event.data === null) {
    console.log("Received null data");
   } else if (event.data instanceof Blob) {
    const reader = new FileReader();
    reader.onload = () => {
     if (reader.result instanceof ArrayBuffer) {
      const buffer = new Uint8Array(reader.result);
      const update = decodeOneofUpdate(buffer);
      console.log("Decoded update", update);

      if (update.game_starting) {
       console.log("game starting");
       setWords(
        (update.game_starting.phrase || "").split(" ")
       );
      } else if (update.youve_been_added_to_game != null) {
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
       console.log(update.player_joined_game?.player_name);
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

 const handleWordComplete = (word: string) => {
  const finishedWordRequest: OneofRequest = {
   sender_id: token,
   type_word: {
    word: words[wordIndex],
   },
  };
  setWordIndex((index) => index + 1);
  setPlayers((players) =>
   players.map((player) =>
    player.id === token
     ? {
        id: player.id,
        name: player.name,
        progress: (wordIndex + 1) / words.length,
       }
     : player
   )
  );
  ws?.send(encodeOneofRequest(finishedWordRequest));
 };

 const findGame: FindGameRequest = {
  player_name: playerName,
 };
 const request: OneofRequest = {
  sender_id: token,
  find_game: findGame,
 };

 return (
  <div className="App">
   <header className="App-header">
    <TypeBox
     words={words}
     wordIndex={wordIndex}
     onWordComplete={handleWordComplete}
    />
    {players.map((player) => (
     <Player
      key={player.name}
      name={player.name}
      progress={player.progress}
     />
    ))}
    <div>
     <input
      type="text"
      value={playerName}
      onChange={(e) => setPlayerName(e.target.value)}
      placeholder="Jeff"
     />
     <button
      onClick={() => ws?.send(encodeOneofRequest(request))}
     >
      Find Game
     </button>
    </div>
    <Stars />
   </header>
  </div>
 );
}

export default App;

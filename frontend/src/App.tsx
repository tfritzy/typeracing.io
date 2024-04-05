import React from "react";
import "./App.css";
import {
  FindGameRequest,
  encodeFindGameRequest,
  OneofRequest,
  encodeOneofRequest,
  decodeOneofUpdate,
} from "./compiled";

function App() {
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const [token, setToken] = React.useState<string>("");
  const [phrase, setPhrase] = React.useState<string | undefined>();
  const [players, setPlayers] = React.useState<string[]>([]);

  React.useEffect(() => {
    const token = "tkn_" + Math.random().toString(36).substring(7);
    setToken(token);
    var ws = new WebSocket(`ws://localhost:5000/?token=${token}`);
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
              setPhrase(update.game_starting.phrase);
            } else if (update.player_joined_game) {
              console.log(update.player_joined_game?.player_name);
              setPlayers((players) => [
                ...players,
                update.player_joined_game?.player_name || "<unknown>",
              ]);
            }
          }
        };
        reader.readAsArrayBuffer(event.data);
      }
      // reader.readAsArrayBuffer(event.data);
      // console.log("Received", event);
      // const update = decodeOneofUpdate(new Uint8Array(event.data));
      // console.log("Decoded update", update);
      // if (update.game_starting) {
      //   console.log("game starting");
      //   setPhrase(update.game_starting.phrase);
      // } else if (update.player_joined_game) {
      //   console.log(update.player_joined_game?.player_name);
      //   setPlayers((players) => [
      //     ...players,
      //     update.player_joined_game?.player_name || "<unknown>",
      //   ]);
      // }
    };
    ws.onclose = () => {
      console.log("Disconnected");
    };
    setWs(ws);
    return () => {
      ws.close();
    };
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (ws) {
      ws.send(event.target.value);
    }
  };

  const findGame: FindGameRequest = {
    player_name: "Jeff",
  };
  const request: OneofRequest = {
    sender_id: token,
    find_game: findGame,
  };

  return (
    <div className="App">
      <header className="App-header">
        {players.map((player) => (
          <p key={player}>{player}</p>
        ))}
        {phrase}
        <input type="text" onChange={handleInput} />
        <button onClick={() => ws?.send(encodeOneofRequest(request))}>
          Find Game
        </button>
      </header>
    </div>
  );
}

export default App;

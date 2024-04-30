import React from "react";
import { decodeOneofUpdate } from "./compiled";
import { InGame } from "./InGame";
import { useDispatch, useSelector } from "react-redux";
import {
 GameStage,
 setGameStarting,
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
import { updatePlayer } from "./store/playerSlice";
import { MainMenu } from "./MainMenu";
import { TextColor } from "./constants";
import { RootState } from "./store/store";

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
};

function App() {
 const dispatch = useDispatch();
 const [ws, setWs] = React.useState<WebSocket | null>(null);
 const isInGame = useSelector(
  (state: RootState) =>
   state.game.state !== GameStage.Invalid
 );

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
       dispatch(
        setGameStarting({
         stage: GameStage.Countdown,
         phrase: update.game_starting.phrase || "",
         countdown: update.game_starting.countdown || 0,
        })
       );
      } else if (update.youve_been_added_to_game != null) {
       dispatch(
        setYouveBeenAddedToGame(
         update.youve_been_added_to_game
        )
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

 let content;
 if (!isInGame) {
  content = <MainMenu sendRequest={sendRequest} />;
 } else {
  content = <InGame sendRequest={sendRequest} />;
 }

 return (
  <div className="flex flex-col items-center">
   <div
    className="relative w-[800px] p-8"
    style={{ color: TextColor }}
   >
    {content}
   </div>
  </div>
 );
}

export default App;

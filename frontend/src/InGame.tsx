import React from "react";
import { TypeBox } from "./TypeBox";
import {
 OneofRequest,
 encodeOneofRequest,
} from "./compiled";

import { Player } from "./Player";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import {
 GameStage,
 GameState,
 wordFinished,
} from "./store/gameSlice";

type InGameProps = {
 sendRequest: (request: ArrayBuffer) => void;
};

export const InGame = (props: InGameProps) => {
 const dispatch = useDispatch();
 const gameState: GameState = useSelector(
  (state: RootState) => state.game
 );
 const player = useSelector(
  (state: RootState) => state.player
 );
 const [wordIndex, setWordIndex] = React.useState(0);

 const { words, players, state } = gameState;

 const handleWordComplete = (word: string) => {
  const finishedWordRequest: OneofRequest = {
   sender_id: player.token,
   type_word: {
    word: words[wordIndex],
   },
  };
  setWordIndex(wordIndex + 1);
  props.sendRequest(
   encodeOneofRequest(finishedWordRequest)
  );
  dispatch(
   wordFinished({
    id: player.token,
    progress: (wordIndex + 1) / words.length,
   })
  );
 };

 return (
  <div>
   <div className="flex flex-col justify-center space-y-8 h-[70vh]">
    {state === GameStage.WaitingForPlayers && (
     <div className="text-2xl text-center text-white">
      Waiting for players...
     </div>
    )}
    {players.map((player) => (
     <Player
      key={player.id}
      name={player.name}
      progress={player.progress}
     />
    ))}
   </div>
   <div className="fixed bottom-[10%] flex flex-col items-center w-screen">
    <div>
     <TypeBox
      words={words}
      wordIndex={wordIndex}
      onWordComplete={handleWordComplete}
     />
    </div>
   </div>
  </div>
 );
};

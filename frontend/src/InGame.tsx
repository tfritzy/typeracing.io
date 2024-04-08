import React from "react";
import { TypeBox } from "./TypeBox";
import {
 OneofRequest,
 encodeOneofRequest,
} from "./compiled";
import { PlayerData } from "./App";
import { Player } from "./Player";

type InGameProps = {
 sendRequest: (request: ArrayBuffer) => void;
 words: string[];
 token: string;
 players: PlayerData[];
 setPlayers: (players: PlayerData[]) => void;
};

export const InGame = (props: InGameProps) => {
 const [wordIndex, setWordIndex] = React.useState(0);

 const handleWordComplete = (word: string) => {
  const finishedWordRequest: OneofRequest = {
   sender_id: props.token,
   type_word: {
    word: props.words[wordIndex],
   },
  };
  setWordIndex((index) => index + 1);
  props.setPlayers(
   props.players.map((player: PlayerData) =>
    player.id === props.token
     ? {
        id: player.id,
        name: player.name,
        progress: (wordIndex + 1) / props.words.length,
       }
     : player
   )
  );
  props.sendRequest(
   encodeOneofRequest(finishedWordRequest)
  );
 };

 return (
  <div>
   <div className="flex flex-col justify-center space-y-8 h-[70vh]">
    {props.players.map((player) => (
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
      words={props.words}
      wordIndex={wordIndex}
      onWordComplete={handleWordComplete}
     />
    </div>
   </div>
  </div>
 );
};

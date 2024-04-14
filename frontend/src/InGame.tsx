import React from "react";
import { TypeBox } from "./TypeBox";
import { OneofRequest, encodeOneofRequest } from "./compiled";
import { Players } from "./Players";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameStage, GameState } from "./store/gameSlice";
import { BackgroundColor } from "./constants";

type InGameProps = {
  sendRequest: (request: ArrayBuffer) => void;
};

export const InGame = (props: InGameProps) => {
  const gameState: GameState = useSelector((state: RootState) => state.game);
  const player = useSelector((state: RootState) => state.player);
  const [wordIndex, setWordIndex] = React.useState(0);

  const { words, state } = gameState;

  const handleWordComplete = (word: string) => {
    const finishedWordRequest: OneofRequest = {
      sender_id: player.id,
      type_word: {
        word: words[wordIndex],
      },
    };
    setWordIndex(wordIndex + 1);
    props.sendRequest(encodeOneofRequest(finishedWordRequest));
  };

  return (
    <div className="flex flex-col h-screen">
      <div
        className="flex flex-col items-center w-screen border-b border-neutral-200 py-4 text-white text-xl font-semibold uppercase shadow-lg"
        style={{ backgroundColor: BackgroundColor }}
      >
        Lightspeed Typeracing
      </div>
      <div className="flex flex-col flex-grow justify-center space-y-8 h-[70vh]">
        {state === GameStage.WaitingForPlayers && (
          <div className="text-2xl text-center text-white">
            Waiting for players...
          </div>
        )}
        <Players />
      </div>
      <div
        className="flex flex-col items-center w-screen border-t border-neutral-200 py-8"
        style={{ backgroundColor: BackgroundColor }}
      >
        <TypeBox
          words={words}
          wordIndex={wordIndex}
          onWordComplete={handleWordComplete}
        />
      </div>
    </div>
  );
};

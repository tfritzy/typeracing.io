import React from "react";
import { TypeBox } from "./TypeBox";
import {
 OneofRequest,
 encodeOneofRequest,
} from "./compiled";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameStage, GameState } from "./store/gameSlice";
import { BackgroundColor } from "./constants";
import { Countdown } from "./Countdown";
import { Results } from "./Results";

type InGameProps = {
 sendRequest: (request: ArrayBuffer) => void;
};

export const InGame = (props: InGameProps) => {
 const { sendRequest } = props;
 const gameState: GameState = useSelector(
  (state: RootState) => state.game
 );
 const player = useSelector(
  (state: RootState) => state.player
 );
 const [lockCharIndex, setLockCharIndex] =
  React.useState(0);
 const { phrase, state } = gameState;

 const handleWordComplete = React.useCallback(
  (newLockIndex: number, characterTimes: number[]) => {
   const word = phrase.slice(
    lockCharIndex,
    newLockIndex - lockCharIndex
   );

   const finishedWordRequest: OneofRequest = {
    sender_id: player.id,
    type_word: {
     word: word,
    },
   };

   setLockCharIndex(newLockIndex);
   sendRequest(encodeOneofRequest(finishedWordRequest));
  },
  [lockCharIndex, phrase, player.id, sendRequest]
 );

 let centerMessage;
 if (state === GameStage.Countdown) {
  centerMessage = (
   <Countdown endTime={gameState.start_time} />
  );
 }

 let content;
 if (
  state === GameStage.WaitingForPlayers ||
  state === GameStage.Countdown ||
  state === GameStage.Racing
 ) {
  content = (
   <>
    <div
     className="relative flex flex-col items-center w-screen border-b border-neutral-200 py-4 text-white text-xl font-semibold uppercase shadow-lg"
     style={{ backgroundColor: BackgroundColor }}
    >
     {GameStage[state]}
    </div>
    <div className="relative flex flex-col flex-grow justify-center space-y-8 h-[70vh]">
     {centerMessage && (
      <div className="absolute left-[50%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 text-2xl text-white">
       {centerMessage}
      </div>
     )}
     {/* <Players /> */}
    </div>

    <div
     className="flex flex-col items-center w-screen border-t border-neutral-200 pb-24 pt-8"
     style={{ backgroundColor: BackgroundColor }}
    >
     <TypeBox
      phrase={phrase}
      lockedCharacterIndex={0}
      onWordComplete={handleWordComplete}
     />
    </div>
   </>
  );
 } else if (
  state === GameStage.ViewingResults ||
  state === GameStage.Finished
 ) {
  content = <Results />;
 }

 return (
  <div className="flex flex-col h-screen">{content}</div>
 );
};

import React from "react";
import { TypeBox } from "./TypeBox";
import {
 OneofRequest,
 encodeOneofRequest,
} from "./compiled";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameStage, GameState } from "./store/gameSlice";
import { Countdown } from "./Countdown";
import { Results } from "./Results";
import { Players } from "./Players";
import { AnimatedDots } from "./AnimatedDots";
import { ActionBar } from "./ActionBar";
import { HomeBreadcrumb } from "./HomeBreadcrumb";
import { Logo } from "./Logo";

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
   const word = phrase
    .slice(lockCharIndex, newLockIndex)
    .trim();

   const finishedWordRequest: OneofRequest = {
    sender_id: player.id,
    type_word: {
     word: word,
     char_completion_times: characterTimes,
    },
   };

   setLockCharIndex(newLockIndex);
   sendRequest(encodeOneofRequest(finishedWordRequest));
  },
  [lockCharIndex, phrase, player.id, sendRequest]
 );

 const isGameOver =
  state === GameStage.Finished ||
  state === GameStage.ViewingResults;

 return (
  <div>
   <div className="relative flex flex-col space-y-12 justify-center font-thin h-screen">
    <div className="absolute left-0 top-0 flex flex-row justify-between pt-2">
     <Logo />
    </div>
    <div
     className="relative flex flex-col justify-end"
     style={{ flexGrow: !isGameOver ? "1" : undefined }}
    >
     <Players />
    </div>

    {!isGameOver && (
     <div className="grow-[2]">
      <TypeBox
       phrase={phrase}
       lockedCharacterIndex={lockCharIndex}
       onWordComplete={handleWordComplete}
       startTime={
        gameState.start_time || Date.now() + 1000000
       }
      />
     </div>
    )}
    {isGameOver && <Results />}
    {isGameOver && <ActionBar sendRequest={sendRequest} />}
   </div>
  </div>
 );
};

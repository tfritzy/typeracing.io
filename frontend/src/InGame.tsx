import React from "react";
import { TypeBox } from "./TypeBox";
import { OneofRequest, encodeOneofRequest } from "./compiled";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameStage, GameState } from "./store/gameSlice";
import { BackgroundColor } from "./constants";
import { Countdown } from "./Countdown";
import { Results } from "./Results";
import { Players } from "./Players";
import { AnimatedDots } from "./AnimatedDots";

type InGameProps = {
  sendRequest: (request: ArrayBuffer) => void;
};

export const InGame = (props: InGameProps) => {
  const { sendRequest } = props;
  const gameState: GameState = useSelector((state: RootState) => state.game);
  const player = useSelector((state: RootState) => state.player);
  const [lockCharIndex, setLockCharIndex] = React.useState(0);
  const { phrase, state } = gameState;

  const handleWordComplete = React.useCallback(
    (newLockIndex: number, characterTimes: number[]) => {
      const word = phrase.slice(lockCharIndex, newLockIndex).trim();

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

  let centerMessage: JSX.Element | string = "";
  if (state === GameStage.WaitingForPlayers) {
    centerMessage = (
      <div>
        <span>Waiting for players</span>
        <AnimatedDots />
      </div>
    );
  } else if (state === GameStage.Countdown) {
    centerMessage = (
      <div>
        <span>Starting in </span>
        <Countdown endTime={gameState.start_time} />
      </div>
    );
  } else {
    centerMessage = " ";
  }

  if (
    state === GameStage.WaitingForPlayers ||
    state === GameStage.Countdown ||
    state === GameStage.Racing
  ) {
    return (
      <div className="h-screen flex flex-col space-y-20 font-thin">
        <div className="text-2xl leading-none">{centerMessage}</div>

        <div className="relative flex flex-col justify-center space-y-8">
          {/* {centerMessage && (
            <div className="absolute left-[50%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 text-2xl text-white">
              {centerMessage}
            </div>
          )} */}
          <Players />
        </div>

        <TypeBox
          phrase={phrase}
          lockedCharacterIndex={lockCharIndex}
          onWordComplete={handleWordComplete}
          startTime={gameState.race_start_time}
        />
      </div>
    );
  } else if (
    state === GameStage.ViewingResults ||
    state === GameStage.Finished
  ) {
    return <Results />;
  } else {
    return null;
  }
};

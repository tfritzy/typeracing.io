import React from "react";
import { TypeBox } from "./TypeBox";
import { KeyStroke, OneofRequest, encodeOneofRequest } from "./compiled";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameStage, GameState, reset } from "./store/gameSlice";
import { Results } from "./Results";
import { Players } from "./Players";
import { ActionBar } from "./ActionBar";
import { Logo } from "./Logo";
import { Countdown } from "./Countdown";
import { useNavigate, useParams } from "react-router-dom";

type InGameProps = {
  sendRequest: (request: ArrayBuffer) => void;
};

export const InGame = (props: InGameProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { gameId } = useParams<{ gameId: string }>();
  const { sendRequest } = props;
  const gameState: GameState = useSelector((state: RootState) => state.game);
  const player = useSelector((state: RootState) => state.player);
  const [lockCharIndex, setLockCharIndex] = React.useState(0);
  const { phrase, state } = gameState;

  const handleWordComplete = React.useCallback(
    (newLockIndex: number, keyStrokes: KeyStroke[], errors: number) => {
      const word = phrase.slice(lockCharIndex, newLockIndex).trim();

      const finishedWordRequest: OneofRequest = {
        sender_id: player.id,
        sender_token: player.token,
        type_word: {
          word: word,
          key_strokes: keyStrokes,
          num_errors: errors,
        },
      };

      setLockCharIndex(newLockIndex);
      sendRequest(encodeOneofRequest(finishedWordRequest));
    },
    [lockCharIndex, phrase, player.id, player.token, sendRequest]
  );

  React.useEffect(() => {
    if (gameState.id !== gameId) {
      dispatch(reset());
      navigate("/");
    }
  }, [dispatch, gameId, gameState.id, navigate]);

  const isGameOver =
    state === GameStage.Finished || state === GameStage.ViewingResults;
  const startTime = gameState.start_time || Date.now() + 1000000;

  if (gameId !== gameState.id) {
    return null;
  }

  return (
    <div>
      <div className="relative flex flex-col space-y-8 justify-center font-thin h-screen">
        <div className="absolute left-0 top-0 flex flex-row justify-between py-2">
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
              startTime={startTime}
            />
          </div>
        )}
        {isGameOver && <Results />}
        {isGameOver && <ActionBar sendRequest={sendRequest} />}
      </div>
      {Date.now() < startTime + 1500 && (
        <div className="absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
          <Countdown startTime={startTime} />
        </div>
      )}
    </div>
  );
};

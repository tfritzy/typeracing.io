import React, { useCallback, useEffect } from "react";
import { TypeBox } from "../components/TypeBox";
import {
  GameMode,
  KeyStroke,
  OneofRequest,
  decodeOneofUpdate,
} from "../compiled";
import { RootState } from "../store/store";
import {
  GameStage,
  GameState,
  handleGameStarting,
  playerDisconnected,
  playerFinished,
  playerJoinedGame,
  reset,
  selfFinished,
  setGameOver,
  setGameStarted,
  setYouveBeenAddedToGame,
  wordFinished,
} from "../store/gameSlice";
import { Results } from "./Results";
import { Players } from "./Players";
import { ActionBar } from "./ActionBar";
import { Countdown } from "./Countdown";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { useConnectionContext } from "../ConnectionProvider";
import { sendFindGameRequest } from "../helpers/functions";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  useAppSelector,
  useGameDispatch,
  useGameSelector,
} from "../store/storeHooks";
import { GameStoreDispatch, GameStoreState } from "../store/gameStore";
import { saveRaceResult } from "../helpers/raceResults";
import { addRaceResult } from "../store/playerSlice";
import { GoLabel } from "./GoLabel";

const handleMessage = (
  event: MessageEvent<any>,
  dispatch: GameStoreDispatch,
  navigate: NavigateFunction,
  playerId: string,
  currentGameId: string
) => {
  if (event.data === null) {
  } else if (event.data instanceof Blob) {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        const buffer = new Uint8Array(reader.result);
        const update = decodeOneofUpdate(buffer);

        if (update.youve_been_added_to_game != null) {
          dispatch(setYouveBeenAddedToGame(update.youve_been_added_to_game));
        }

        if (update.game_id !== currentGameId) {
          return;
        }

        if (update.game_starting) {
          dispatch(handleGameStarting(update.game_starting));
        } else if (update.player_joined_game) {
          dispatch(playerJoinedGame(update.player_joined_game));
        } else if (update.game_started) {
          dispatch(setGameStarted());
        } else if (update.game_over) {
          dispatch(setGameOver(update.game_over));
        } else if (update.player_disconnected) {
          if (!update.player_disconnected.is_you) {
            dispatch(playerDisconnected(update.player_disconnected));
          } else {
            dispatch(reset());
            navigate("/", { replace: true });
          }
        } else if (update.player_completed) {
          dispatch(playerFinished(update.player_completed));
          if (update.player_completed.player_id === playerId) {
            dispatch(selfFinished());
            const raceResult = {
              accuracy: update.player_completed.accuracy || 0,
              mode: update.player_completed.mode || GameMode.Invalid,
              time: Date.now(),
              wpm: update.player_completed.wpm || 0,
            };
            saveRaceResult(raceResult);
            dispatch(addRaceResult(raceResult));
          }
        } else if (update.word_finished) {
          dispatch(wordFinished(update.word_finished));
        }
      }
    };
    reader.readAsArrayBuffer(event.data);
  }
};

export const InGame = () => {
  const gameState: GameState = useGameSelector(
    (state: GameStoreState) => state.game
  );
  const player = useAppSelector((state: RootState) => state.player);
  const [lockCharIndex, setLockCharIndex] = React.useState(0);
  const { phrase, state } = gameState;
  const { ws, sendRequest } = useConnectionContext();
  const navigate = useNavigate();
  const dispatch = useGameDispatch();
  const isGameOver =
    state === GameStage.Finished || state === GameStage.ViewingResults;
  const startTime = gameState.start_time || Date.now() + 1000000;

  const resetState = useCallback(() => {
    setLockCharIndex(0);
  }, []);

  useEffect(() => {
    if (player.id) {
      sendFindGameRequest(sendRequest, player);
    }
  }, [player, sendRequest]);

  useEffect(() => {
    ws.onmessage = (event) =>
      handleMessage(event, dispatch, navigate, player.id || "", gameState.id);
  }, [dispatch, gameState.id, navigate, player, sendRequest, ws]);

  const handleWordComplete = React.useCallback(
    (newLockIndex: number, keyStrokes: KeyStroke[], errors: number) => {
      const word = phrase.slice(lockCharIndex, newLockIndex).trim();
      for (let i = 0; i < keyStrokes.length; i++)
      {
        keyStrokes[i].time = keyStrokes[i].time! - startTime;
      }

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
      sendRequest(finishedWordRequest);
    },
    [lockCharIndex, phrase, player.id, player.token, sendRequest, startTime]
  );

  if (!gameState.id) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="relative flex flex-col space-y-8 justify-center font-thin h-screen">
        <div
          className="relative flex flex-col justify-end"
          style={{ flexGrow: !isGameOver ? "1" : undefined }}
        >
          <Players />
        </div>

        {!isGameOver && (
          <div className="grow-[2] px-2">
            <TypeBox
              phrase={phrase}
              lockedCharacterIndex={lockCharIndex}
              onWordComplete={handleWordComplete}
              isLocked={Date.now() - startTime < 0}
            />
          </div>
        )}
        {isGameOver && <Results />}
        {isGameOver && (
          <ActionBar sendRequest={sendRequest} resetState={resetState} />
        )}
      </div>
      {Date.now() < startTime + 1500 && (
        <div className="absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
          <Countdown startTime={startTime} />
        </div>
      )}

      <div className="absolute -left-16 top-2">
        <GoLabel startTime={startTime} />
      </div>
    </div>
  );
};

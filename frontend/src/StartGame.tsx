import React from "react";
import { FindGameRequest, OneofRequest, encodeOneofRequest } from "./compiled";
import { FullPhraseTypeBox } from "./FullPhraseTypeBox";
import { DesignPencil, GraduationCap, Group, Lock } from "iconoir-react";

type StartGameProps = {
  token: string;
  playerName: string;
  setPlayerName: (name: string) => void;
  sendRequest: (request: ArrayBuffer) => void;
};

export enum Mode {
  Practice,
  Multiplayer,
}

enum State {
  Menu,
  EnteringStardate,
  Engage,
}

export const StartGame = (props: StartGameProps) => {
  const [state, setState] = React.useState<State>(State.Menu);

  const findGame: FindGameRequest = {
    player_name: props.playerName,
  };
  const request: OneofRequest = {
    sender_id: props.token,
    find_game: findGame,
  };

  let content;
  if (state === State.Menu) {
    content = (
      <div className="border border-neutral-100 ">
        <div className="text-2xl w-full bg-neutral-100 text-neutral-900 px-4 py-2 uppercase font-semibold">
          Lightspeed Typeracing
        </div>

        <div className="flex flex-col">
          <div className="px-4 pb-6 pt-4 flex flex-col">
            <div className="mb-5">
              <div className="text-md font-semibold flex flex-row space-x-1 items-center">
                <div>Multiplayer</div>
                <Group height={16} width={16} />
              </div>
              <div className="text-sm text-neutral-200">
                Race against players across the galaxy
              </div>
            </div>

            <button
              className="text-neutral-800 px-2 py-2 bg-neutral-100 font-bold"
              onClick={() => setState(State.EnteringStardate)}
            >
              <div>Join race</div>
            </button>
          </div>

          <div className="w-full border-t border-neutral-100" />

          <div className="flex flex-col">
            <div className="px-4 pb-6 pt-4">
              <div className="mb-3">
                <div className="flex flex-row space-x-1 items-center">
                  <div>Practice</div>
                  <GraduationCap height={16} width={16} />
                </div>
                <div className="text-sm text-neutral-200">
                  Race by your self to improve your typing skills
                </div>
              </div>

              <button
                className="border border-neutral-100 text-neutral-100 px-3 py-2 bg-neutral-900 font-bold"
                onClick={() => setState(State.EnteringStardate)}
              >
                Start practice
              </button>
            </div>
          </div>

          <div className="w-full border-t border-neutral-100" />

          <div className="flex flex-col">
            <div className="px-4 pb-6 pt-4 ">
              <div className="mb-3">
                <div className="flex flex-row space-x-1 items-center">
                  <div>Race against friends</div>
                  <Lock height={16} width={16} />
                </div>
                <div className="text-sm text-neutral-200">
                  Create a private lobby and invite your friends
                </div>
              </div>

              <button
                className="border border-neutral-100 text-neutral-100 px-3 py-2 bg-neutral-900 font-bold"
                onClick={() => setState(State.EnteringStardate)}
              >
                Create lobby
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (state === State.EnteringStardate) {
    content = (
      <FullPhraseTypeBox
        key="stardate"
        phrase="Helm: Set course for gemini IV, warp 2"
        onPhraseComplete={() => setState(State.Engage)}
      />
    );
  } else {
    content = (
      <FullPhraseTypeBox
        key="engage"
        phrase="Engage."
        onPhraseComplete={() => props.sendRequest(encodeOneofRequest(request))}
      />
    );
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-white">
      <div className="flex flex-col space-y-16">{content}</div>
    </div>
  );
};

import React from "react";
import { FindGameRequest, OneofRequest, encodeOneofRequest } from "./compiled";
import { GraduationCap, Group, Lock } from "iconoir-react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { BackgroundColor } from "./constants";
import { ModesSection } from "./ModesSection";

type MainMenuProps = {
  sendRequest: (request: ArrayBuffer) => void;
};

export const MainMenu = (props: MainMenuProps) => {
  const player = useSelector((state: RootState) => state.player);
  const findGame: FindGameRequest = {
    player_name: player.name,
    player_token: player.token,
  };
  const request: OneofRequest = {
    sender_id: player.id,
    find_game: findGame,
  };

  return (
    <div className="font-thin">
      <div className="flex flex-col">
        <div className="px-4 pb-8 pt-4 flex flex-col">
          <div className="mb-5">
            <div className="text-lg font-semibold flex flex-row space-x-1 items-center">
              <div>Multiplayer</div>
            </div>
            <div className="text-md text-neutral-200">
              Race against players across the galaxy
            </div>
          </div>

          <div>
            <button
              className="font-bold py-2 px-4 border"
              onClick={() => props.sendRequest(encodeOneofRequest(request))}
            >
              <div>Join race</div>
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="px-4 pb-8 pt-4">
            <div className="mb-3">
              <div className="flex flex-row space-x-1 items-center font-semibold">
                <div>Practice</div>
                <GraduationCap height={16} width={16} />
              </div>
              <div className="text-md text-neutral-200">
                Race by your self to improve your typing skills
              </div>
            </div>

            <button
              className="border border-neutral-100 text-neutral-100 px-3 py-2 font-bold"
              onClick={() => alert("Coming soon!")}
            >
              Start practice
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="px-4 pb-6 pt-4 ">
            <div className="mb-3">
              <div className="flex flex-row space-x-1 items-center font-semibold">
                <div>Race against friends</div>
                <Lock height={16} width={16} />
              </div>
              <div className="text-md text-neutral-200">
                Create a private lobby and invite your friends
              </div>
            </div>

            <button
              className="border border-neutral-100 text-neutral-100 px-3 py-2 font-bold"
              onClick={() => alert("Coming soon!")}
            >
              Create lobby
            </button>
          </div>
        </div>

        <ModesSection />
      </div>
    </div>
  );
};

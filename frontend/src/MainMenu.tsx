import React from "react";
import {
 FindGameRequest,
 OneofRequest,
 encodeOneofRequest,
} from "./compiled";
import { GraduationCap, Lock } from "iconoir-react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { ModesSection } from "./ModesSection";
import { Button } from "./Button";
import { TextColor } from "./constants";

type MainMenuProps = {
 sendRequest: (request: ArrayBuffer) => void;
};

export const MainMenu = (props: MainMenuProps) => {
 const player = useSelector(
  (state: RootState) => state.player
 );
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
   <div className="flex flex-col space-y-6">
    <div
     className="pt-4 flex flex-col"
     style={{ borderColor: TextColor }}
    >
     <div className="mb-2">
      <div className="text-lg  font-semibold flex flex-row space-x-1 items-center">
       <div>Multiplayer</div>
      </div>
      <div className="text-md text-neutral-200">
       Race against players across the galaxy
      </div>
     </div>

     <div>
      <Button
       onClick={() =>
        props.sendRequest(encodeOneofRequest(request))
       }
       type="primary"
      >
       <span className="px-5">Join race</span>
      </Button>
     </div>
    </div>

    <div className="flex flex-col">
     <div className="pt-4">
      <div className="mb-2">
       <div className="flex flex-row space-x-1 items-center font-semibold">
        <div>Practice</div>
        <GraduationCap height={16} width={16} />
       </div>
       <div className="text-md text-neutral-200">
        Race by your self to improve your typing skills
       </div>
      </div>

      <Button
       type="secondary"
       onClick={() => alert("Coming soon!")}
      >
       Start practice
      </Button>
     </div>
    </div>

    <div className="flex flex-col">
     <div className="pt-4 ">
      <div className="mb-2">
       <div className="flex flex-row space-x-1 items-center font-semibold">
        <div>Race against friends</div>
        <Lock height={16} width={16} />
       </div>
       <div className="text-md text-neutral-200">
        Create a private lobby and invite your friends
       </div>
      </div>

      <Button
       type="secondary"
       onClick={() => alert("Coming soon!")}
      >
       Create lobby
      </Button>
     </div>
    </div>

    <div />
    <ModesSection />
   </div>
  </div>
 );
};

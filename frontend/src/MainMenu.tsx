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
import { ProfileButton } from "./ProfileButton";
import { GameConfig } from "./GameConfig";

type MainMenuProps = {
 sendRequest: (request: ArrayBuffer) => void;
};

export const MainMenu = (props: MainMenuProps) => {
 const player = useSelector(
  (state: RootState) => state.player
 );

 const findGame = React.useCallback(() => {
  const findGame: FindGameRequest = {
   player_name: player.name,
   player_token: player.token,
  };
  const request: OneofRequest = {
   sender_id: player.id,
   find_game: findGame,
  };

  props.sendRequest(encodeOneofRequest(request));
 }, []);

 return (
  <div className="">
   <div className="flex flex-row-reverse">
    <ProfileButton />
   </div>
   <div className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%]">
    <button>Find race</button>
    <GameConfig />
   </div>
  </div>
 );
};

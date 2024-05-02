import React from "react";
import { FindGameRequest, OneofRequest, encodeOneofRequest } from "./compiled";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { ProfileButton } from "./ProfileButton";
import { GameConfig } from "./GameConfig";
import { TypeBoxButton } from "./TypeBoxButton";

type MainMenuProps = {
  sendRequest: (request: ArrayBuffer) => void;
};

export const MainMenu = (props: MainMenuProps) => {
  const player = useSelector((state: RootState) => state.player);

  const findGame = React.useCallback(() => {
    const findGame: FindGameRequest = {
      player_name: player.name,
      player_token: player.token,
      game_modes: player.enabledModes,
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
      <div className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] flex flex-col space-y-12">
        <TypeBoxButton phrase="Find game" onPhraseComplete={findGame} />
        <GameConfig />
      </div>
    </div>
  );
};

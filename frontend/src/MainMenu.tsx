import React from "react";
import { FindGameRequest, OneofRequest, encodeOneofRequest } from "./compiled";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
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
  }, [player.enabledModes, player.id, player.name, player.token, props]);

  return (
    <div>
      <div className="fixed left-0 top-0 w-screen h-screen flex flex-col space-y-24 items-center justify-center">
        <TypeBoxButton phrase="Find game" onPhraseComplete={findGame} />
        <GameConfig />
      </div>
    </div>
  );
};

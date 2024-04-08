import React from "react";
import {
 FindGameRequest,
 OneofRequest,
 encodeOneofRequest,
} from "./compiled";
import { FullPhraseTypeBox } from "./FullPhraseTypeBox";

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
 const [state, setState] = React.useState<State>(
  State.Menu
 );

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
   <div className="flex flex-col space-y-16">
    <FullPhraseTypeBox
     key="join race"
     phrase="Enter race"
     onPhraseComplete={() => {
      setState(State.EnteringStardate);
     }}
    />
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
    onPhraseComplete={() =>
     props.sendRequest(encodeOneofRequest(request))
    }
   />
  );
 }

 return (
  <div className="w-full h-screen flex flex-col items-center justify-center text-white">
   <div className="text-4xl">Lightspeed Typeracing</div>
   <img
    src="/splash.webp"
    alt="Ship"
    className="w-96 h-96"
   />

   <div>
    <div className="text-md">In amber clad</div>
    <img src="/Ship.svg" alt="Ship" className="w-32 h-32" />
   </div>

   <div className="flex flex-col space-y-16">{content}</div>
  </div>
 );
};

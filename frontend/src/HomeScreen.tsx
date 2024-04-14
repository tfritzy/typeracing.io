import React from "react";
import { MainMenu } from "./MainMenu";

type StartGameProps = {
  sendRequest: (request: ArrayBuffer) => void;
};

export const HomeScreen = (props: StartGameProps) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-white">
      <div className="flex flex-row space-x-4">
        <MainMenu sendRequest={props.sendRequest} />
      </div>
    </div>
  );
};

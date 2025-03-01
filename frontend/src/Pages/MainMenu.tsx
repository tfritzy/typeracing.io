import React, { useEffect, useState } from "react";
import { TypeBoxButton } from "../components/TypeBoxButton";
import { useNavigate } from "react-router-dom";
import { flatModes } from "../modes";
import { ModeListPage } from "../components/ModeList";
import { ModeType } from "@shared/types";

export function MainMenu({ modeType }: { modeType: ModeType }) {
  const [modeShown, setModeShown] = useState<boolean>(false);
  const navigate = useNavigate();
  const mode = flatModes[modeType];
  const [phrase] = React.useState(
    mode.startupPhrases[Math.floor(Math.random() * mode.startupPhrases.length)]
  );

  const goToRoute = React.useCallback(() => {
    navigate("/" + mode.type + "/search");
  }, [mode, navigate]);

  const toggleModeShown = React.useCallback(() => {
    setModeShown(!modeShown);
  }, [modeShown]);

  const close = React.useCallback(() => {
    setModeShown(false);
  }, []);

  useEffect(() => {
    document.title = mode.name + " - TypeRacing.io";
  }, [mode.name]);

  useEffect(() => {
    const handleHotkeys = async (event: KeyboardEvent) => {
      if (event.key === "/") {
        toggleModeShown();
        event.stopPropagation();
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleHotkeys);

    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, [modeShown, toggleModeShown]);

  return (
    <>
      <div className="flex flex-col items-center space-y-40">
        <div className="border-b-2 rounded-lg px-4 py-2 border-accent w-max">
          <div className={mode.formatting === "code" ? "mono" : ""}>
            <TypeBoxButton phrase={phrase} onPhraseComplete={goToRoute} />
          </div>
        </div>
        <div className="">
          <div className="relative flex flex-col space-x-1 items-center text text-base-400">
            <button
              className=" space-x-3 items-center py-2 px-2 border border-base-700 rounded-full w-max text-base-400 flex flex-row shadow-sm shadow-black/25 bg-black/10"
              onClick={toggleModeShown}
            >
              <img src={mode.icon} className="h-8 w-8 rounded-full" />

              <h1 className="text-xl font-semibold">{mode.name}</h1>

              <div className="w-8 h-8 text-center bg-base-800 border border-base-700 rounded-full font-semibold text-lg">
                /
              </div>
            </button>
            <ModeListPage shown={modeShown} onClose={close} />
          </div>
        </div>
      </div>
    </>
  );
}

import React, { useEffect, useState } from "react";
import { TypeBoxButton } from "./TypeBoxButton";
import { useNavigate } from "react-router-dom";
import { flatModes, ModeType } from "./modes";
import { ModeListPage } from "./ModeListPage";
import { Hotkey } from "./components/Hotkey";

const phrases = [
  "glhf",
  "glgl",
  "ready for dust-off",
  "let's go",
  "commence bombardment",
  "ready to plunder",
  "fortune favors the bold",
  "let's get into the fight",
  "systems primed",
  "bring it",
  "oh, it's on",
  "let's do this",
  "it's go time",
  "it's about to get heavy",
  "put me in coach",
];

export function MainMenu({ modeType }: { modeType: ModeType }) {
  const [modeShown, setModeShown] = useState<boolean>(false);
  const navigate = useNavigate();
  const [phrase] = React.useState(
    phrases[Math.floor(Math.random() * phrases.length)]
  );
  const mode = flatModes[modeType];

  const goToRoute = React.useCallback(() => {
    navigate("/search/" + mode.type);
  }, [mode, navigate]);

  const toggleModeShown = React.useCallback(() => {
    setModeShown(!modeShown);
  }, [modeShown]);

  const close = React.useCallback(() => {
    setModeShown(false);
  }, []);

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
      <div className="flex flex-col items-center space-y-24">
        <div className="border-b-2 border-base-700 p-2 shadow-accent w-max">
          <TypeBoxButton phrase={phrase} onPhraseComplete={goToRoute} />
        </div>
        <div className="">
          <div className="relative flex flex-col space-x-1 items-center text text-base-400">
            {/* <div className="font-bold mb-1">Mode</div> */}
            <button
              className=" space-x-2 items-center py-1 pl-2 pr-3 border border-base-700 rounded-md w-max text-base-400 flex flex-row shadow-sm shadow-black/25"
              onClick={toggleModeShown}
            >
              <img src={mode.icon} className="h-6 w-6 rounded brightness-90" />

              <h1 className="text-xl font-semibold">{mode.name}</h1>
              <Hotkey code="/" />
            </button>
            <ModeListPage shown={modeShown} onClose={close} />
          </div>
        </div>
      </div>
    </>
  );
}

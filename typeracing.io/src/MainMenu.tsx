import React, { useEffect, useState } from "react";
import { TypeBoxButton } from "./TypeBoxButton";
import { useNavigate } from "react-router-dom";
import { flatModes, ModeType } from "./modes";
import { ModeListPage } from "./ModeListPage";

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
    navigate("/race?mode=" + mode);
  }, [mode, navigate]);

  const toggleModeShown = React.useCallback(() => {
    setModeShown(!modeShown);
  }, [modeShown]);

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
  }, [toggleModeShown]);

  return (
    <>
      <div className="flex flex-col space-y-36 items-center">
        <div className="border-b-2 border-base-700 p-2 shadow-accent w-max">
          <TypeBoxButton phrase={phrase} onPhraseComplete={goToRoute} />
        </div>

        <button
          className="flex flex-row space-x-3 items-center p-[6px] px-4 border-2 border-base-700 shadow-sm  rounded-full w-max text-base-400"
          onClick={toggleModeShown}
        >
          <img
            src={mode.icon}
            className="h-6 w-6 rounded-md border border-base-700"
          />

          <h1 className="text-2xl">{mode.name}</h1>
          <div className="border border-base-700 text-base-500 px-2 rounded-sm">
            /
          </div>
        </button>
      </div>
      <ModeListPage shown={modeShown} />
    </>
  );
}

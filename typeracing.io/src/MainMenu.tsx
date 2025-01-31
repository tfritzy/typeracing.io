import React from "react";
import { TypeBoxButton } from "./TypeBoxButton";
import { useNavigate } from "react-router-dom";
import { modes, ModeType } from "./modes";

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
  const navigate = useNavigate();
  const [phrase] = React.useState(
    phrases[Math.floor(Math.random() * phrases.length)]
  );
  const mode = modes[modeType];

  const goToRoute = React.useCallback(() => {
    navigate("/race?mode=" + mode);
  }, [mode, navigate]);

  return (
    <>
      <div className="">
        <div className="absolute top-2 left-0 text-stone-500">
          <div>
            <div className="flex flex-row space-x-2 items-baseline">
              <h1 className="text-2xl font-semibold mb-1">{mode.name}</h1>
              <img src={mode.icon} className="h-4 rounded-sm" />
            </div>
            <p className="text-stone-600 max-w-72">{mode.description}</p>
          </div>
        </div>

        <div className="border-b-2 border-base-700 p-2 shadow-accent w-max">
          <TypeBoxButton phrase={phrase} onPhraseComplete={goToRoute} />
        </div>
      </div>
    </>
  );
}

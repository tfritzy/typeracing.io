import React from "react";
import { TypeBoxButton } from "./TypeBoxButton";
import { useNavigate } from "react-router-dom";

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

export function MainMenu() {
  const navigate = useNavigate();
  const [phrase] = React.useState(
    phrases[Math.floor(Math.random() * phrases.length)]
  );

  const goToRoute = React.useCallback(() => {
    navigate("/race");
  }, [navigate]);

  return (
    <div className="">
      <div className="absolute top-2 left-0 text-stone-500">
        <div>
          <div className="flex flex-row space-x-2 items-baseline">
            <img
              src="/flags/gb.svg"
              className="w-8 h-8 border border-base-600 rounded"
            />
            <h1 className="text-md font-semibold mb-2">English </h1>
            <button className="text-lg border border-base-700 text-base-500 px-2 py-1 rounded-md">
              <div className="leading-none text-lg font-mono text-center">
                /
              </div>
            </button>
          </div>
          <p className="text-stone-600 max-w-72">
            500 most common english words
          </p>
        </div>
      </div>

      <div className="border-b-2 border-base-700 p-2 shadow-accent w-max">
        <TypeBoxButton phrase={phrase} onPhraseComplete={goToRoute} />
      </div>
    </div>
  );
}

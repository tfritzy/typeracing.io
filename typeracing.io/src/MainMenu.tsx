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
    <div className="border-b-2 border-base-700 p-2 shadow-accent">
      <TypeBoxButton phrase={phrase} onPhraseComplete={goToRoute} />
    </div>
  );
}

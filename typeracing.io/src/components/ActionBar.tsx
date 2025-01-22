import { useCallback, useEffect } from "react";
import { Hotkey } from "./Hotkey";
import { findGame } from "../helpers";
import { useNavigate } from "react-router-dom";
import { User } from "firebase/auth";

type Props = {
  user: User;
  showStats: () => void;
};

export function ActionBar(props: Props) {
  const navigate = useNavigate();

  const playAgain = useCallback(async () => {
    await findGame(props.user, navigate);
  }, [navigate, props.user]);

  const returnToMainMenu = useCallback(async () => {
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const handleHotkeys = async (event: KeyboardEvent) => {
      if (event.key === "p") {
        await playAgain();
      }

      if (event.key === "m") {
        returnToMainMenu();
      }

      if (event.key === "s") {
        props.showStats();
      }
    };

    document.addEventListener("keydown", handleHotkeys);

    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, [navigate, playAgain, props, props.user, returnToMainMenu]);

  return (
    <div className="flex flex-row bg-base-800 border-2 border-base-700 rounded-full text-base-400 w-min py-2 px-4 space-x-4 shadow-md ">
      <button
        className="w-max flex flex-row space-x-2 items-baseline rounded-lg"
        onClick={playAgain}
      >
        <Hotkey code="m" /> <div>Main Menu</div>
      </button>
      <div className="w-[2px] bg-base-600" />
      <button
        className="w-max flex flex-row space-x-2 items-baseline rounded-lg"
        onClick={returnToMainMenu}
      >
        <Hotkey code="p" /> <div>Play Again</div>
      </button>
      <div className="w-[2px] bg-base-600" />
      <button
        className="w-max flex flex-row space-x-2 items-baseline rounded-lg"
        onClick={props.showStats}
      >
        <Hotkey code="s" /> <div>Show stats</div>
      </button>
    </div>
  );
}

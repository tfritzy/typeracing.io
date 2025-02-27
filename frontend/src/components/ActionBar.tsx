import { useCallback, useEffect } from "react";
import { Hotkey } from "./Hotkey";
import { useNavigate } from "react-router-dom";
import { ModeType } from "@shared/types";

type Props = {
  showStats: () => void;
  mode: ModeType | undefined;
};

export function ActionBar({ showStats, mode }: Props) {
  const navigate = useNavigate();

  const playAgain = useCallback(async () => {
    navigate(mode + "/search/");
  }, [mode, navigate]);

  const returnToMainMenu = useCallback(
    async (e: { preventDefault: () => void }) => {
      if (mode) {
        navigate("/" + mode);
      } else {
        navigate("/");
      }
      e.preventDefault();
    },
    [mode, navigate]
  );

  useEffect(() => {
    const handleHotkeys = async (event: {
      key: string;
      preventDefault: () => void;
    }) => {
      if (event.key === "p") {
        await playAgain();
      }

      if (event.key === "m") {
        returnToMainMenu(event);
      }

      if (event.key === "r") {
        showStats();
      }
    };

    document.addEventListener("keydown", handleHotkeys);

    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, [navigate, playAgain, returnToMainMenu, showStats]);

  return (
    <div className="flex flex-row bg-base-800 border-2 border-base-700 rounded-full text-base-400 w-min py-2 px-4 space-x-4 shadow-md ">
      <button
        className="w-max flex flex-row space-x-2 items-baseline rounded-lg"
        onClick={returnToMainMenu}
      >
        <Hotkey code="m" /> <div>Main Menu</div>
      </button>
      <div className="w-[1px] bg-base-600" />
      <button
        className="w-max flex flex-row space-x-2 items-baseline rounded-lg"
        onClick={playAgain}
      >
        <Hotkey code="p" /> <div>Play Again</div>
      </button>
      <div className="w-[1px] bg-base-600" />
      <button
        className="w-max flex flex-row space-x-2 items-baseline rounded-lg"
        onClick={showStats}
      >
        <Hotkey code="r" /> <div>Results</div>
      </button>
    </div>
  );
}

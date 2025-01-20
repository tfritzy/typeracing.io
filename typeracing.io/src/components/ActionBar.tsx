import { useEffect } from "react";
import { Hotkey } from "./Hotkey";
import { findGame } from "../helpers";
import { useNavigate } from "react-router-dom";
import { User } from "firebase/auth";

type Props = {
  user: User;
};

export function ActionBar(props: Props) {
  const navigate = useNavigate();
  useEffect(() => {
    const handleHotkeys = async (event: KeyboardEvent) => {
      if (event.key === "p") {
        await findGame(props.user, navigate);
      }

      if (event.key === "m") {
        navigate("/");
      }
    };

    document.addEventListener("keydown", handleHotkeys);

    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, [navigate, props.user]);

  return (
    <div className="flex flex-row bg-stone-800 border-2 border-stone-700 rounded-full text-stone-400 w-min py-2 px-4 space-x-4 shadow-md ">
      <div className="w-max flex flex-row space-x-2 items-baseline">
        <Hotkey code="m" /> <div>Main Menu</div>
      </div>
      <div className="w-[2px] bg-stone-500" />
      <div className="w-max flex flex-row space-x-2 items-baseline">
        <Hotkey code="p" /> <div>Play Again</div>
      </div>
    </div>
  );
}

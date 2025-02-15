import { Link, useNavigate } from "react-router-dom";
import { Hotkey } from "./Hotkey";
import { useEffect } from "react";

export function ProfileButton() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleHotkeys = async (event: {
      key: string;
      preventDefault: () => void;
    }) => {
      if (event.key === "`" || event.key === "~") {
        navigate("/profile");
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleHotkeys);

    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, []);

  return (
    <Link to="/profile" className="flex flex-row items-center space-x-2">
      <Hotkey code="~" />
      <div className="text-base-400">Profile</div>
    </Link>
  );
}

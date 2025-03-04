import { Link, useNavigate } from "react-router-dom";
import { Hotkey } from "./Hotkey";
import { useEffect } from "react";

export function ProfileButton({ onPage }: { onPage: boolean }) {
  const navigate = useNavigate();
  useEffect(() => {
    const handleHotkeys = async (event: {
      key: string;
      preventDefault: () => void;
    }) => {
      if (event.key === "\\") {
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
    <Link
      to="/profile"
      className="flex flex-row items-center font-semibold space-x-2 text-base-500 hover:text-base-300"
      style={{ color: onPage ? "var(--base-400)" : "" }}
    >
      <Hotkey code="\" />
      <div className="">Profile</div>
    </Link>
  );
}

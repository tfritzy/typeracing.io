import { Link, useLocation } from "react-router-dom";
import { ProfileButton } from "./ProfileButton";
import { KeyboardIcon } from "../icons/keyboard";
import { validModes } from "../modes";

export const Header = () => {
  const location = useLocation();
  let currentMode: string | undefined = decodeURIComponent(
    location.pathname.split("/")[1] || ""
  );

  if (!validModes.has(currentMode)) currentMode = "";

  return (
    <div className="w-screen flex flex-row justify-center shadow-sm">
      <div className="flex flex-row justify-between w-full max-w-[1280px] min-w-max px-16 py-2 pt-4 bg-base-800 ">
        <div className="flex flex-row items-center space-x-6">
          <Link
            to={"/" + currentMode}
            className="font-semibold flex flex-row space-x-1 rounded-lg text-lg text-base-500 w-max focus:text-accent hover:text-accent focus:stroke-accent hover:stroke-accent outline-none fill-base-500 stroke-base-500"
          >
            <KeyboardIcon />
            <span>TypeRacing.io</span>
          </Link>
        </div>
        <ProfileButton />
      </div>
    </div>
  );
};

export default Header;

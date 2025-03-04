import { Link, useLocation } from "react-router-dom";
import { ProfileButton } from "./ProfileButton";
import { KeyboardIcon } from "../icons/keyboard";
import { validLanguageModes, validProgrammingModes } from "../modes";

export const Header = () => {
  const location = useLocation();
  const currentMode: string | undefined = decodeURIComponent(
    location.pathname.split("/")[1] || ""
  );

  let currentPage: "code" | "profile" | "languages" | undefined = undefined;
  if (location.pathname.includes("/code")) currentPage = "code";
  else if (validProgrammingModes.has(currentMode)) currentPage = "code";
  else if (location.pathname.includes("/profile")) currentPage = "profile";
  else currentPage = "languages";

  const targetLanguagePath = validLanguageModes.has(currentMode)
    ? `/${currentMode}`
    : "/";
  const targetCodePath = validProgrammingModes.has(currentMode)
    ? `/code/${currentMode}`
    : "/code/";

  return (
    <div className="w-screen flex flex-row justify-center shadow-md border-b border-base-700 bg-black/10 px-16 py-3">
      <div className="flex flex-row justify-between w-full max-w-[1280px] min-w-max ">
        <div className="flex flex-row items-center space-x-6">
          <Link
            to={currentPage === "code" ? targetCodePath : targetLanguagePath}
            className="font-semibold flex flex-row space-x-1 rounded-lg text-lg text-base-500 w-max hover:text-base-400 hover:stroke-base-400 hover:fill-base-400 outline-none fill-base-500 stroke-base-500"
            id="home-button"
          >
            <KeyboardIcon />
            <span>TypeRacing.io</span>
          </Link>

          <Link
            className="text-base-500 font-bold hover:text-base-400"
            style={{
              color: currentPage === "languages" ? "var(--base-400)" : "",
            }}
            to={targetLanguagePath}
          >
            Languages
          </Link>
          <Link
            className="text-base-500 font-bold hover:text-base-400"
            style={{
              color: currentPage === "code" ? "var(--base-400)" : "",
            }}
            to={targetCodePath}
          >
            Code
          </Link>
        </div>
        <ProfileButton onPage={currentPage === "profile"} />
      </div>
    </div>
  );
};

export default Header;

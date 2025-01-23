import { Link, useMatch } from "react-router-dom";
import { Profile } from "./Profile";

export const Header = () => {
  const onRace = useMatch("/race/*");

  return (
    <div className="fixed top-2 left-0 w-screen flex flex-row justify-center">
      <div className="flex flex-row justify-between w-full max-w-[1190px] min-w-max">
        <Link
          to="/"
          className="font-bold flex flex-row space-x-1 px-2 py-1 rounded-lg text-lg text-base-400 w-min focus:outline outline-accent"
        >
          <span className="">⌨</span>
          <span className="">typeracing.io</span>
        </Link>

        {!onRace && <Profile />}
      </div>
    </div>
  );
};

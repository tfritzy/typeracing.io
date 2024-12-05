import { Clock, ClockSolid, WhiteFlag, WhiteFlagSolid } from "iconoir-react";
import { Link, useMatch } from "react-router-dom";
import { Profile } from "../main-menu/Profile";

export const Header = () => {
  const onTimeTrials = useMatch("/time-trials/*");
  const onRace = useMatch("/race/*");
  const onMainMenu = useMatch("/race");

  return (
    <div className="p-2 flex flex-row space-x-1 items-center justify-center bg-base-800-50 border-b border-base-600">
      <div className="max-w-[900px] w-full flex flex-row justify-between text-md">
        <div className="flex flex-row space-x-2 items-center">
          <Link
            to="/"
            className="font-bold flex flex-row logo px-2 py-1 rounded-lg text-lg"
          >
            <span className="">type</span>
            <span className="">racing</span>
            <span className="text-accent">.io</span>
          </Link>

          <div className="h-5/6 border-r border-base-700 w-[1px]" />

          <Link
            to="/race"
            className="font-semibold px-2 py-1 rounded-lg text-center flex flex-row space-x-1 items-center justify-center"
            style={{
              color: onRace ? "var(--accent)" : "var(--base-300)",
            }}
          >
            <div>Race</div>
            {/* {onRace ? (
              <WhiteFlagSolid className="w-4 h-4" />
            ) : (
              <WhiteFlag className="w-4 h-4" />
            )} */}
          </Link>

          <div className="h-3/4 border-r border-base-700 w-[1px]" />

          <Link
            to="/time-trials"
            className="font-semibold px-2 py-1 rounded-lg flex flex-row space-x-1 items-center justify-center"
            style={{
              color: onTimeTrials ? "var(--accent)" : "var(--base-300)",
            }}
          >
            <div>Time trials</div>
            {/* {onTimeTrials ? (
              <ClockSolid className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )} */}
          </Link>
        </div>

        {onMainMenu && <Profile />}
      </div>
    </div>
  );
};

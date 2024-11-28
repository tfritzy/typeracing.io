import { NavArrowRight, WhiteFlag } from "iconoir-react";
import { Link, useMatch } from "react-router-dom";

export const Logo = () => {
  const onTimeTrials = useMatch("/time-trials/*");

  return (
    <div className="py-4 flex flex-row space-x-1 items-center">
      <Link
        to="/"
        className="font-bold envision-binary-hail-two
       flex flex-row logo "
      >
        <span className="">type</span>
        <span className="">racing</span>
        <span className="text-accent">.io</span>
      </Link>

      {onTimeTrials && <NavArrowRight height={20} />}

      {onTimeTrials && (
        <Link to="/time-trials" className="font-semibold">
          <div className="flex flex-row items-center space-x-1">
            <div>Time trials</div>
            <WhiteFlag className="text-accent" height={16} />
          </div>
        </Link>
      )}
    </div>
  );
};

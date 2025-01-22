import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <div className="fixed top-2 left-0 w-screen flex flex-row justify-center">
      <div className="w-full max-w-[1190px] min-w-max">
        <Link
          to="/"
          className="font-bold flex flex-row px-2 py-1 rounded-lg text-lg text-base-400 w-min"
        >
          <span className="">type</span>
          <span className="">racing</span>
          <span className="">.io</span>
        </Link>
      </div>
    </div>
  );
};

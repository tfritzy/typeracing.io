import { Lock, Map } from "iconoir-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <div className="p-2 flex flex-row space-x-1 items-center justify-center text-sm bg-base-800-50 border-t border-base-600">
      <Link
        to="/roadmap"
        className="px-2 py-1 rounded-lg text-center flex flex-row space-x-1 items-center justify-center"
      >
        <Map className="w-4 h-4" />
        <div>Roadmap</div>
      </Link>

      <Link
        to="/privacy-policy"
        className="px-2 py-1 rounded-lg text-center flex flex-row space-x-1 items-center justify-center"
      >
        <Lock className="w-4 h-4" />
        <div>Privacy Policy</div>
      </Link>
    </div>
  );
};

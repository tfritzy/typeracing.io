import { Link } from "react-router-dom";

export function Footer() {
  return (
    <div className="flex flex-row w-full justify-center space-x-2 text-base-600 pb-2">
      <Link to="/privacy-policy">Privacy Policy</Link>
      <div>|</div>
      <Link to="/stats">Site Stats</Link>
      <div>|</div>
      <Link to="https://github.com/tfritzy/typeracing.io">Github</Link>
    </div>
  );
}

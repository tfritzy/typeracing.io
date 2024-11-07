import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link
      to="/"
      className="rounded-lg py-2 border border-border-color px-3 flex flex-row font-bold logo w-min h-min bg-neutral-color"
    >
      <span className="">Type</span>
      <span className="">Racing</span>
      <span className="text-accent-secondary">.io</span>
    </Link>
  );
};

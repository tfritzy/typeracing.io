import { NeutralColor } from "./constants";

export const Logo = () => {
  return (
    <a
      className="rounded-lg py-2 px-3 flex flex-row font-bold logo w-min h-min"
      style={{ backgroundColor: NeutralColor }}
      href="/"
    >
      <span className="">Type</span>
      <span className="">Racing</span>
      <span className="text-accent">.io</span>
    </a>
  );
};
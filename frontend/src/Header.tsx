import { Logo } from "./Logo";

export function Header() {
  return (
    <div className="fixed left-0 top-0 w-full flex flex-row border-b border-accent p-2">
      <Logo />
    </div>
  );
}

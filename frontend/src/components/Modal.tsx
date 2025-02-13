import { useEffect } from "react";

type Props = {
  title: string;
  children: JSX.Element;
  betweenChildren?: JSX.Element;
  onClose: () => void;
  shown: boolean;
};
export function Modal({
  title,
  children,
  betweenChildren,
  onClose,
  shown,
}: Props) {
  useEffect(() => {
    const handleHotkeys = async (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleHotkeys);

    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, [onClose]);

  return (
    <>
      <div
        className={`fixed -top-6 left-0 w-screen h-screen z-0 ${
          shown ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {shown && betweenChildren}

      <div
        className={`fixed left-1/2 shadow-lg shadow-black/25 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-800 border-base-700 border rounded-lg transition-all duration-300 ${
          shown
            ? "opacity-100 -translate-y-1/2"
            : "opacity-0 pointer-events-none -translate-y-[47%]"
        }`}
      >
        <div className="flex flex-row justify-between w-full text-base-300 text-xl px-4 py-1">
          <div>{title}</div>
        </div>
        {children}
      </div>
    </>
  );
}

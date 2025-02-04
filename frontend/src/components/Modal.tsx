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
        className={`fixed -top-6 left-0 w-screen bg-black/5 h-screen transition-opacity duration-300 z-0 ${
          shown ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {shown && betweenChildren}

      <div
        className={`fixed left-1/2 shadow-lg shadow-black/25 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-800 border-base-700 border rounded-lg w-[800px] max-w-900px transition-all duration-300 ${
          shown
            ? "opacity-100 -translate-y-1/2"
            : "opacity-0 pointer-events-none -translate-y-[47%]"
        }`}
      >
        <div className="flex flex-row justify-between w-full border-b border-base-700 text-base-400 font-semibold text-xl px-2 pl-4 py-1">
          <div>{title}</div>
          <button
            onClick={onClose}
            className="hover:text-base-200 transition-colors"
            aria-label="Close modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

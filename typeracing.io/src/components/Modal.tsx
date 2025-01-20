type Props = {
  title: string;
  children: JSX.Element;
  onClose: () => void;
  shown: boolean;
};
export function Modal(props: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed -top-6 left-0 w-screen h-screen bg-black/25 transition-opacity duration-300 ${
          props.shown ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={props.onClose}
      />

      {/* Modal */}
      <div
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-good-stone border-stone-700 border rounded-lg w-[80vw] max-w-900px drop-shadow-2xl shadow-stone-950 transition-all duration-300 ${
          props.shown
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex flex-row justify-between w-full border-b border-stone-700 text-stone-400 font-semibold text-xl px-2 py-1">
          <div>{props.title}</div>
          <button
            onClick={props.onClose}
            className="hover:text-stone-200 transition-colors"
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
        {props.children}
      </div>
    </>
  );
}

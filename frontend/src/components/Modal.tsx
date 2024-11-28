import { Xmark } from "iconoir-react";

type Props = {
  title?: String;
  onClose?: () => void;
  shown: boolean;
  children: JSX.Element;
};

export function Modal(props: Props) {
  return (
    <div
      className="fixed backdrop-blur-xl backdrop-brightness-[.8] shadow-2xl shadow-gray-950 overflow-y-auto rounded-lg border border-base-800 left-1/2 top-1/2"
      style={{
        opacity: props.shown ? 1 : 0,
        transform: props.shown
          ? "translate(-50%, -50%)"
          : "translate(-50%, calc(-50% + 20px))",
        transition: "opacity 0.2s, transform 0.2s",
      }}
    >
      {props.title && (
        <div className="flex flex-row justify-between px-8 p-3 w-full border-b border-base-800">
          <div className="font-semibold">{props.title}</div>

          {props.onClose && (
            <button
              className="text-base-200 hover:text-error-color transition-colors"
              onClick={props.onClose}
            >
              <Xmark width={24} />
            </button>
          )}
        </div>
      )}

      <div className="p-4">{props.children}</div>

      {props.onClose && (
        <div className="flex flex-row justify-end pl-8 p-3 w-full border-b border-base-800">
          <button
            className="text-accent rounded-md px-2 py-1 font-semibold"
            onClick={props.onClose}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

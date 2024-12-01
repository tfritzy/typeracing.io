import React, { useEffect, useRef } from "react";
import { Xmark } from "iconoir-react";

const focusable =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

type Props = {
  title?: String;
  onClose?: () => void;
  shown: boolean;
  children: JSX.Element;
};

export function Modal(props: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (props.shown) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(focusable);
        const firstElement = focusableElements[0] as HTMLElement;
        firstElement?.focus();
      }

      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "unset";
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [props.shown]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!props.shown) return;

    if (event.key === "Escape" && props.onClose) {
      props.onClose();
      return;
    }

    if (event.key === "Tab") {
      const focusableElements = modalRef.current?.querySelectorAll(focusable);

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={props.title ? "modal-title" : undefined}
      ref={modalRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="fixed backdrop-blur-xl backdrop-brightness-[.8] shadow-2xl shadow-gray-950 overflow-y-auto rounded-lg border border-base-800 left-1/2 top-1/2"
      style={{
        opacity: props.shown ? 1 : 0,
        pointerEvents: props.shown ? "all" : "none",
        transform: props.shown
          ? "translate(-50%, -50%)"
          : "translate(-50%, calc(-50% + 20px))",
        transition: "opacity 0.2s, transform 0.2s",
      }}
    >
      {props.title && (
        <div className="flex flex-row justify-between px-8 p-3 w-full border-b border-base-800">
          <div id="modal-title" className="font-semibold">
            {props.title}
          </div>
          {props.onClose && (
            <button
              className="text-base-200 hover:text-error-color transition-colors"
              onClick={props.onClose}
              aria-label="Close modal"
            >
              <Xmark width={24} />
            </button>
          )}
        </div>
      )}
      <div className="">{props.children}</div>
    </div>
  );
}

export default Modal;

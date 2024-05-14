import React, { useEffect, useRef } from "react";
import { Xmark } from "iconoir-react";
import {
  BackgroundColor,
  NeutralColor,
  TertiaryTextColor,
  TextColor,
} from "./constants";

type ModalProps = {
  children: React.ReactNode;
  title: string;
  open: boolean;
  onClose: () => void;
};

export const Modal = (props: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        props.onClose();
      }
    };

    const dialogElement = dialogRef.current;

    if (props.open && dialogElement) {
      document.body.style.overflow = "hidden";
      dialogElement.focus();
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [props.open]);

  return (
    <dialog
      ref={dialogRef}
      id="modal"
      open={props.open}
      className="rounded-lg shadow-lg text-main transition-all shadow-[#00000055]"
      style={{
        backgroundColor: NeutralColor + "aa",
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        className="flex flex-row justify-between w-full p-3 pl-4 font-semibold border-b"
        style={{ borderColor: TertiaryTextColor }}
      >
        <div>{props.title}</div>
        <button onClick={props.onClose} className="rounded-full">
          <Xmark />
        </button>
      </div>
      <div className="flex w-full flex-col justify-center p-4">
        {props.children}
      </div>
    </dialog>
  );
};

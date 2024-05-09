import { Xmark } from "iconoir-react";
import {
  AccentColor,
  BackgroundColor,
  NeutralColor,
  TertiaryTextColor,
  TextColor,
} from "./constants";
import React, { useEffect, useRef } from "react";
import { Hotkey } from "./Hotkey";

type DrawerProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const Drawer = (props: DrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        props.onClose();
      }
    };

    const handleEscapePress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        props.onClose();
      }
    };

    if (props.open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapePress);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapePress);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapePress);
    };
  }, [props.open, props.onClose]);

  return (
    <div
      className={`fixed flex flex-col shadow-lg h-screen bottom-0 right-0 transition-transform transform ${
        props.open ? "" : "translate-x-full"
      }`}
      style={{ backgroundColor: NeutralColor }}
      ref={drawerRef}
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

      <div className="grow">{props.children}</div>

      <div
        className="flex flex-row justify-between w-full p-3 pl-4 font-semibold border-t"
        style={{ borderColor: TertiaryTextColor }}
      >
        <button
          onClick={props.onClose}
          className="rounded-md border px-3 py-1 flex flex-row items-center space-x-2"
          style={{
            color: TextColor,
            borderColor: TextColor,
          }}
        >
          <div>Done</div>
          <Hotkey code="Esc" />
        </button>
      </div>
    </div>
  );
};

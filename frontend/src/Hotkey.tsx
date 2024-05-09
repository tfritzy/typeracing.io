import React from "react";
import {
  AccentColor,
  BackgroundColor,
  SecondaryTextColor,
  TertiaryTextColor,
  TextColor,
} from "./constants";

type HotkeyProps = {
  code: string;
};

export const Hotkey = (props: HotkeyProps) => {
  return (
    <div
      className="text-xs font-mono rounded px-[4px] font-semibold w-min"
      style={{ backgroundColor: TextColor + "20", color: TextColor }}
    >
      {props.code}
    </div>
  );
};

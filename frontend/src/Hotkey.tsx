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
 accent?: boolean;
 large?: boolean;
};

export const Hotkey = (props: HotkeyProps) => {
 return (
  <div
   className={`${
    props.large
     ? "text-sm font-bold px-[7px]"
     : " text-xs font-semibold px-[5px]"
   } uppercase font-mono rounded w-min translate-y-[1px]`}
   style={{
    backgroundColor: props.accent
     ? AccentColor + "20"
     : TextColor + "20",
    color: props.accent ? AccentColor : TextColor,
   }}
  >
   {props.code}
  </div>
 );
};

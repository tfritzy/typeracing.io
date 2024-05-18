import React from "react";
import {
 AccentColor,
 SecondaryTextColor,
 TextColor,
 VeryChillBorder,
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
     ? "text-md font-semibold px-[9px]"
     : " text-sm px-[6px]"
   } uppercase font-mono rounded w-min translate-y-[1px]`}
   style={{
    backgroundColor: props.accent
     ? AccentColor + "11"
     : VeryChillBorder,
    borderColor: props.accent
     ? AccentColor + "20"
     : TextColor + "20",
    color: props.accent ? AccentColor : SecondaryTextColor,
   }}
  >
   {props.code}
  </div>
 );
};

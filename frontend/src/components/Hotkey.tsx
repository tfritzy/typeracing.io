import React from "react";

type HotkeyProps = {
  code: string;
  accent?: boolean;
  large?: boolean;
};

export const Hotkey = (props: HotkeyProps) => {
  return (
    <div
      className={`${
        props.large ? "text-md font-semibold px-[9px]" : " text-sm px-[6px]"
      } uppercase font-mono rounded w-min translate-y-[1px]`}
      style={{
        backgroundColor: props.accent
          ? "var(--accent-200)"
          : "var(--border-color)",
        borderColor: props.accent
          ? "var(--accent-200)"
          : "var(--text-primary)" + "20",
        color: props.accent ? "var(--accent)" : "var(--text-secondary)",
      }}
    >
      {props.code}
    </div>
  );
};

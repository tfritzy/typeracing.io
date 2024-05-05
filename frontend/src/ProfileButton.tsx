import { KeyframeSolid } from "iconoir-react";
import React from "react";
import { TextColor } from "./constants";

type ProfileButtonProps = {};

export const ProfileButton = (props: ProfileButtonProps) => {
  return (
    <button
      className="rounded-full p-1 shadow-lg border-2"
      style={{ borderColor: TextColor }}
    >
      <KeyframeSolid width={30} height={30} />
    </button>
  );
};

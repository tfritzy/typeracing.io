import { KeyframeSolid } from "iconoir-react";
import React from "react";

type ProfileButtonProps = {};

export const ProfileButton = (
 props: ProfileButtonProps
) => {
 return (
  <button className="bg-red-900 rounded-full p-3 shadow-lg border-2 border-white">
   <KeyframeSolid width={30} height={30} />
  </button>
 );
};

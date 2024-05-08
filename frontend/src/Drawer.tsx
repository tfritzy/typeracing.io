import { Xmark } from "iconoir-react";
import {
 NeutralColor,
 TertiaryTextColor,
} from "./constants";
import React, { useEffect, useRef } from "react";

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
   document.addEventListener(
    "mousedown",
    handleClickOutside
   );
   document.addEventListener("keydown", handleEscapePress);
  } else {
   document.removeEventListener(
    "mousedown",
    handleClickOutside
   );
   document.removeEventListener(
    "keydown",
    handleEscapePress
   );
  }

  return () => {
   document.removeEventListener(
    "mousedown",
    handleClickOutside
   );
   document.removeEventListener(
    "keydown",
    handleEscapePress
   );
  };
 }, [props.open, props.onClose]);

 return (
  <div
   className={`fixed h-screen bottom-0 right-0 transition-all transform ${
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
    <button
     onClick={props.onClose}
     className="rounded-full"
    >
     <Xmark />
    </button>
   </div>

   {props.children}
  </div>
 );
};

import React, { useEffect, useRef } from "react";
import { Xmark } from "iconoir-react";
import {
 AccentColor,
 BackgroundColor,
 NeutralColor,
 TertiaryTextColor,
 TextColor,
} from "./constants";

type DrawerProps = {
 title: string;
 open: boolean;
 onClose: () => void;
 children: React.ReactNode;
};

export const Drawer = (props: DrawerProps) => {
 const drawerRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const focusableElements =
   'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let firstFocusableElement: HTMLElement | null = null;
  let lastFocusableElement: HTMLElement | null = null;
  console.log("Mount");

  if (props.open) {
   const focusableContent =
    drawerRef.current?.querySelectorAll(focusableElements);
   if (focusableContent) {
    firstFocusableElement =
     focusableContent[0] as HTMLElement;
    lastFocusableElement = focusableContent[
     focusableContent.length - 1
    ] as HTMLElement;
    firstFocusableElement?.focus();
    console.log("Focus");
   }

   const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Tab") {
     if (event.shiftKey) {
      // Shift + Tab
      if (
       document.activeElement === firstFocusableElement
      ) {
       lastFocusableElement?.focus();
       event.preventDefault();
      }
     } else {
      // Tab
      if (document.activeElement === lastFocusableElement) {
       firstFocusableElement?.focus();
       event.preventDefault();
      }
     }
    } else if (event.key === "Escape") {
     props.onClose();
    }
   };

   document.addEventListener("keydown", handleKeyDown);

   return () => {
    document.removeEventListener("keydown", handleKeyDown);
   };
  }
 }, [props.open]);

 const handleClickOutside = (event: MouseEvent) => {
  if (
   drawerRef.current &&
   !drawerRef.current.contains(event.target as Node)
  ) {
   props.onClose();
  }
 };

 useEffect(() => {
  document.addEventListener(
   "mousedown",
   handleClickOutside
  );
  return () => {
   document.removeEventListener(
    "mousedown",
    handleClickOutside
   );
  };
 }, [props.open]);

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
    <button
     onClick={props.onClose}
     className="rounded-full"
    >
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
     className="rounded-md text-sm font-normal px-3 py-1 flex flex-row items-center space-x-2"
     style={{
      color: AccentColor,
      backgroundColor: AccentColor + "30",
     }}
    >
     Done
    </button>
   </div>
  </div>
 );
};

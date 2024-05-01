import React from "react";
import {
 BrandColor,
 BackgroundColor,
 TextColor,
} from "./constants";

type ButtonProps = {
 children: React.ReactNode;
 onClick: () => void;
 type: "primary" | "secondary";
};

export const Button = (props: ButtonProps) => {
 const { children, onClick } = props;

 return (
  <button
   onClick={onClick}
   className="py-2 px-5 font-semibold border"
   style={{
    backgroundColor:
     props.type === "primary" ? TextColor : BackgroundColor,
    color:
     props.type === "primary" ? BackgroundColor : TextColor,
   }}
  >
   {children}
  </button>
 );
};

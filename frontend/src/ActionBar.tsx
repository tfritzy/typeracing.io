import React from "react";
import {
 Menu,
 RefreshDouble,
 ShareAndroid,
} from "iconoir-react";
import { useDispatch } from "react-redux";
import { reset } from "./store/gameSlice";
import {
 NeutralColor,
 SecondaryTextColor,
} from "./constants";

const TextButton = ({
 children,
 onClick,
}: {
 children: React.ReactNode;
 onClick?: () => void;
}) => {
 return (
  <button
   onClick={onClick}
   className="flex flex-row items-center py-4 space-x-2 text-secondary hover:text-amber-200 outline-none"
  >
   {children}
  </button>
 );
};

export const ActionBar = () => {
 const dispatch = useDispatch();

 return (
  <div className="flex flex-col items-center">
   <div
    style={{ backgroundColor: NeutralColor }}
    className="flex flex-row space-x-6 rounded-lg px-8"
   >
    <TextButton>
     <span>Play again</span>
     <RefreshDouble width={16} height={16} />
    </TextButton>
    <TextButton onClick={() => dispatch(reset())}>
     <span>Share</span>
     <ShareAndroid width={16} height={16} />
    </TextButton>
    <TextButton onClick={() => dispatch(reset())}>
     <span>Main Menu</span>
     <Menu width={16} height={16} />
    </TextButton>
   </div>
  </div>
 );
};

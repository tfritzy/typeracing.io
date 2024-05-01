import React from "react";
import { NavArrowLeft } from "iconoir-react";
import { useDispatch } from "react-redux";
import { reset } from "./store/gameSlice";

export const HomeBreadcrumb = () => {
 const dispatch = useDispatch();

 return (
  <button
   onClick={() => dispatch(reset())}
   className="flex flex-row items-center text-neutral-500 focus:text-neutral-200 hover:text-neutral-200 outline-no       ne"
  >
   <NavArrowLeft width={24} height={24} />
   <div className="text-sm">Main menu</div>
  </button>
 );
};

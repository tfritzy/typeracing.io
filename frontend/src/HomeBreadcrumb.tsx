import React from "react";
import { NavArrowLeft } from "iconoir-react";
import { useDispatch } from "react-redux";
import { reset } from "./store/gameSlice";

export const HomeBreadcrumb = () => {
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => dispatch(reset())}
      className="flex flex-row items-center text-secondaryText focus:text-neutral-200 hover:text-amber-200 outline-none"
    >
      <NavArrowLeft width={24} height={24} strokeWidth={1} />
      <div className="text-sm">Main menu</div>
    </button>
  );
};

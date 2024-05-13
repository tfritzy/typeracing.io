import React from "react";
import { NavArrowLeft } from "iconoir-react";
import { useDispatch } from "react-redux";
import { reset } from "./store/gameSlice";
import { useNavigate } from "react-router-dom";
import { returnToMainMenu } from "./helpers/functions";

export const HomeBreadcrumb = () => {
 const dispatch = useDispatch();
 const navigate = useNavigate();

 const returnToMM = React.useCallback(() => {
  returnToMainMenu(navigate, dispatch);
 }, [reset]);

 return (
  <button
   onClick={returnToMM}
   className="flex flex-row items-center text-secondary focus:text-neutral-200 hover:text-amber-200 outline-none"
  >
   <NavArrowLeft width={24} height={24} strokeWidth={1} />
   <div className="text-sm">Main menu</div>
  </button>
 );
};

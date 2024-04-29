import React from "react";
import { BrandColor } from "./constants";
import { Check } from "iconoir-react";

type CheckboxProps = {
 id: string;
 label: string;
 description: string;
};

export const Checkbox = (props: CheckboxProps) => {
 const [checked, setChecked] = React.useState(false);

 let checkbox;
 if (checked) {
  checkbox = (
   <div
    className="border border-amber-200 w-3 h-3 max-w-3 max-h-3 rounded-sm text-neutral-900 text-md font-bold flex items-center justify-center"
    style={{
     borderColor: BrandColor,
     backgroundColor: BrandColor,
    }}
   >
    <Check strokeWidth={3} height={20} width={20} />
   </div>
  );
 } else {
  checkbox = (
   <div
    className="border border-gray-300 w-3 h-3 max-w-3 max-h-3 rounded-sm"
    style={{ borderColor: "#dad4cb" }}
   ></div>
  );
 }

 return (
  <button
   className="border rounded w-max-min p-2 cursor-pointer hover:shadow-md transition-all duration-100 ease-in-out hover:bg-neutral-900"
   style={{
    borderColor: checked ? "#f3c614" : "#dad4cb",
    color: checked ? "#f3c614" : "#dad4cb",
   }}
   onClick={() => setChecked(!checked)}
  >
   <div className="flex">
    <div className="pt-[4px]">{checkbox}</div>
    <div className="ms-2 text-sm text-start">
     <label htmlFor={props.id} className="font-semibold ">
      {props.label}
     </label>
     <p className="text-xs font-normal opacity-70">
      {props.description}
     </p>
    </div>
   </div>
  </button>
 );
};

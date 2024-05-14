import { EditPencil } from "iconoir-react";
import React from "react";
import { NeutralColor } from "./constants";

type InputWithIconProps = {
 value: string;
 onChange: (
  event: React.ChangeEvent<HTMLInputElement>
 ) => void;
};

export const EditInput = ({
 value,
 onChange,
}: InputWithIconProps) => {
 return (
  <div className="relative w-full text-secondary">
   <input
    type="text"
    value={value}
    onChange={onChange}
    className="pl-3 pr-10 py-2 rounded-lg w-full w-40"
    style={{
     backgroundColor: NeutralColor,
    }}
   />
   <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
    <EditPencil width={16} height={16} />
   </div>
  </div>
 );
};

export default EditInput;

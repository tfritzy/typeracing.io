import { EditPencil } from "iconoir-react";
import React from "react";

type InputWithIconProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const EditInput = ({ value, onChange }: InputWithIconProps) => {
  return (
    <div className="relative w-full text-base-200 border border-base-700 rounded">
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="pl-3 pr-8 py-1 rounded-lg w-[200px] bg-base-900"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <EditPencil width={16} height={16} />
      </div>
    </div>
  );
};

export default EditInput;

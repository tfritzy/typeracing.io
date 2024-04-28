import React from "react";

type CheckboxProps = {
  id: string;
  label: string;
  description: string;
};

export const Checkbox = (props: CheckboxProps) => {
  const [checked, setChecked] = React.useState(false);

  return (
    <div className="border rounded w-max-min p-2 border-neutral-700">
      <div className="flex">
        <div className="flex items-center h-6">
          <input
            id={props.id}
            aria-describedby="helper-checkbox-text"
            type="checkbox"
            value=""
            className="custom-checkbox"
          />
        </div>
        <div className="ms-2 text-sm">
          <label htmlFor={props.id} className="font-semibold ">
            {props.label}
          </label>
          <p className="text-xs font-normal text-neutral-400">
            {props.description}
          </p>
        </div>
      </div>
    </div>
  );
};

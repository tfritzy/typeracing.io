import React, { useEffect } from "react";
import { Hotkey } from "../components/Hotkey";

const TextButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: (event: Event) => void;
}) => {
  return (
    <button
      onClick={onClick as any}
      className="flex w-32 text-base-200 flex-row space-x-2 items-center justify-center rounded-full p-2 hover:text-accent outline-none"
    >
      {children}
    </button>
  );
};

type Option = {
  name: string;
  hotkey: string;
  onPress: (event: Event) => void;
};

type ActionBarProps = {
  options: Option[];
};

export const ActionBar = (props: ActionBarProps) => {
  const { options } = props;

  useEffect(() => {
    const handleHotkeys = (event: KeyboardEvent) => {
      for (let i = 0; i < options.length; i++) {
        if (options[i].hotkey.toLowerCase() === event.key.toLowerCase()) {
          options[i].onPress(event);
        }
      }
    };

    document.addEventListener("keydown", handleHotkeys);

    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, [options]);

  const buttons = React.useMemo(() => {
    return options.map((o, i) => (
      <>
        <TextButton onClick={o.onPress}>
          <span>{o.name}</span>
          <Hotkey code={o.hotkey} />
        </TextButton>
        {i !== options.length - 1 && (
          <div className="h-6 m-auto border-r ml-1 mr-1 py-3 border-base-700" />
        )}
      </>
    ));
  }, [options]);

  return (
    <div className="flex flex-col items-center pb-4">
      <div className="flex flex-row rounded-full px-2 border border-base-600 bg-base-800">
        {buttons}
      </div>
    </div>
  );
};

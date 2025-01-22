type HotkeyProps = {
  code: string;
};

export const Hotkey = (props: HotkeyProps) => {
  return (
    <div
      className="h-5 text-md px-[6px] font-mono uppercase inline-flex items-center justify-center min-w-[20px] text-base-400 border border-base-500 rounded-md"
      style={{
        lineHeight: 1,
      }}
    >
      {props.code}
    </div>
  );
};

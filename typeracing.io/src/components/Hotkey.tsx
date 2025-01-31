type HotkeyProps = {
  code: string;
};

export const Hotkey = (props: HotkeyProps) => {
  return (
    <div
      className="h-5 text-base px-[6px] py-[10px] font-mono uppercase inline-flex items-center justify-center min-w-[20px] text-base-500 border border-base-600 rounded-sm"
      style={{
        lineHeight: 1,
      }}
    >
      {props.code}
    </div>
  );
};

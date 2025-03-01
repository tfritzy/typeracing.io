type HotkeyProps = {
  code: string;
  accent?: boolean;
};

export const Hotkey = (props: HotkeyProps) => {
  return (
    <div
      className="h-5 text-base px-[6px] py-[10px] font-mono uppercase inline-flex items-center justify-center min-w-[20px] border rounded-sm bg-base-800"
      style={{
        lineHeight: 1,
        color: props.accent ? "var(--accent)" : "var(--base-500)",
        borderColor: props.accent ? "var(--accent)" : "var(--base-600)",
      }}
    >
      {props.code}
    </div>
  );
};

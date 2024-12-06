type HotkeyProps = {
  code: string;
  accent?: boolean;
  large?: boolean;
};

export const Hotkey = (props: HotkeyProps) => {
  return (
    <div
      className={`${
        props.large
          ? "h-6 text-md font-semibold px-[9px]"
          : "h-5 text-sm px-[6px]"
      } font-mono uppercase rounded-sm inline-flex items-center justify-center min-w-[20px]`}
      style={{
        backgroundColor: props.accent ? "var(--accent-800)" : "var(--base-700)",
        color: props.accent ? "var(--base-100)" : "var(--base-200)",
        lineHeight: 1,
      }}
    >
      {props.code}
    </div>
  );
};

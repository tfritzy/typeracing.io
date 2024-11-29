type Props = {
  children: JSX.Element | String;
  onClick: () => void;
  primary?: boolean;
};

export const Button = (props: Props) => {
  return (
    <button
      className="text-accent text-sm border border-accent rounded-md px-2 py-1 font-semibold focus:ring-[1px] ring-accent"
      style={
        props.primary
          ? {
              color: "var(--accent)",
              borderColor: "var(--accent)",
            }
          : { color: "var(--base-300)", borderColor: "var(--base-300)" }
      }
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

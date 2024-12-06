type Type = "primary" | "secondary" | "error";

type Props = {
  children: any;
  onClick: () => void;
  type?: Type;
};

const primaryStyle = {
  color: "var(--accent)",
  borderColor: "var(--accent)",
};

const secondaryStyle = {
  color: "var(--base-300)",
  borderColor: "var(--base-300)",
};

const errorStyle = {
  color: "var(--error-color)",
  borderColor: "var(--error-color)",
};

function getStyle(type: Type | undefined) {
  switch (type) {
    case "primary":
      return primaryStyle;
    case "secondary":
      return secondaryStyle;
    case "error":
      return errorStyle;
    default:
      return secondaryStyle;
  }
}

export const Button = (props: Props) => {
  return (
    <button
      className="text-accent text-sm border border-accent rounded-md px-2 py-1 font-semibold focus:ring-[1px] ring-accent"
      style={getStyle(props.type)}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

type Props = {
  selected: boolean;
  children: JSX.Element | string;
  onSelect: () => void;
};

export function ToggleButton(props: Props) {
  if (props.selected) {
    return (
      <button
        onClick={props.onSelect}
        className="border border-accent font-semibold text-accent px-3 py-1 rounded focus:ring-1 focus:ring-accent"
      >
        {props.children}
      </button>
    );
  } else {
    return (
      <button
        onClick={props.onSelect}
        className="border border-base-600 font-semibold text-base-400 px-3 py-1 rounded focus:ring-1 focus:ring-accent"
      >
        {props.children}
      </button>
    );
  }
}

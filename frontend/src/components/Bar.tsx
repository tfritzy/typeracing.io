type BarProps = {
  percentFilled: number;
  greyscale?: boolean;
};

export function Bar(props: BarProps) {
  if (props.greyscale) {
    return (
      <>
        <div className="h-full absolute top-0 left-0 w-full" />
        <div
          className="bg-gradient-to-r from-base-600 to-base-500 rounded transition-all h-full absolute top-0 left-0"
          style={{ width: `${Math.max(props.percentFilled, 3)}%` }}
        />
      </>
    );
  }

  return (
    <>
      <div className="h-full absolute top-0 left-0 w-full" />
      <div
        className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded transition-all h-full absolute top-0 left-0"
        style={{ width: `${Math.max(props.percentFilled, 3)}%` }}
      />
    </>
  );
}

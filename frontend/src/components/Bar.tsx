type BarProps = {
  percentFilled: number;
};

export function Bar(props: BarProps) {
  return (
    <>
      <div className="h-full absolute top-0 left-0 w-full" />
      <div
        className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded transition-all h-full absolute top-0 left-0"
        style={{ width: `${props.percentFilled}%` }}
      />
    </>
  );
}

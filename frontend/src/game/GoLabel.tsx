type GoLabelProps = {
  startTime: number;
};

export const GoLabel = (props: GoLabelProps) => {
  // show 200 ms before start and last for 2 seconds
  const shown =
    Date.now() - props.startTime > -1500 && Date.now() - props.startTime < 1500;

  if (Date.now() - props.startTime > 0) {
    return (
      <img
        src="/bufo-lets-goo.gif"
        className="w-8 h-8 inline transition-colors"
        aria-label="Go!"
        style={{
          transform: "scaleX(-1)",
          opacity: shown ? 1 : 0,
        }}
      />
    );
  } else {
    return (
      <img
        src="/bufo-lets-goo.gif"
        className="w-8 h-8 inline transition-colors"
        aria-label="Go!"
        style={{
          transform: "scaleX(-1)",
          opacity: shown ? 1 : 0,
        }}
      />
    );
  }
};

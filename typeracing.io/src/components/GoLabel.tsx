import { Timestamp } from "firebase/firestore";

type GoLabelProps = {
  startTime: Timestamp;
};

export const GoLabel = (props: GoLabelProps) => {
  const now = Timestamp.now();
  const shown =
    now > props.startTime && now.seconds - props.startTime.seconds < 1.5;

  if (shown) {
    return (
      <img
        src="/bufo-lets-goo.gif"
        className="w-10 h-10 inline transition-opacity"
        aria-label="Go!"
        style={{
          transform: "scaleX(-1)",
          opacity: shown ? 1 : 0,
        }}
      />
    );
  }
};

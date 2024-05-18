import { NeutralColor } from "./constants";

type GoLabelProps = {
 startTime: number;
};

export const GoLabel = (props: GoLabelProps) => {
 if (Date.now() - props.startTime < -500) {
  return null;
 }

 return (
  <img
   src="/bufo-lets-goo.gif"
   className="w-10 h-10 inline"
   aria-label="Go!"
   style={{
    transform: "scaleX(-1)",
   }}
  />
 );
};

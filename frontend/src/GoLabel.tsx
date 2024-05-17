import { NeutralColor } from "./constants";

type GoLabelProps = {
 startTime: number;
};

export const GoLabel = (props: GoLabelProps) => {
 if (Date.now() - props.startTime < -500) {
  return null;
 }

 return (
  <div
   className="bg-accent rounded font-semibold border border-green-500 py-1 px-2"
   style={{ color: NeutralColor }}
  >
   Type!
  </div>
 );
};

type GoLabelProps = {
 startTime: number;
};

export const GoLabel = (props: GoLabelProps) => {
 // show 200 ms before start and last for 2 seconds
 const shown =
  Date.now() - props.startTime > -200 &&
  Date.now() - props.startTime < 1500;

 return (
  <img
   src="/bufo-lets-goo.gif"
   className="w-10 h-10 inline transition-colors"
   aria-label="Go!"
   style={{
    transform: "scaleX(-1)",
    opacity: shown ? 1 : 0,
   }}
  />
 );
};

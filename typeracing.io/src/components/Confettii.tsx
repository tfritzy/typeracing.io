import Conductor from "react-canvas-confetti/dist/conductor";
import Preset from "react-canvas-confetti/dist/presets";

const colors = ["#fde68a", "#d9f99d", "#fbcfe8", "#bfdbfe"];

class SnowConductor extends Conductor {
  tickAnimation = () => {
    this.confetti(
      this.decorateOptions({
        particleCount: 1,
        startVelocity: 0,
        ticks: 500,
        drift: (Math.random() - 0.5) * 1,
        gravity: 0.75,
        scalar: 0.75,
        origin: {
          x: Math.random(),
          y: 0,
        },
        colors: ["#fbbf24"],
        shapes: ["circle", "square"],
      })
    );
  };
}

export function Confettii() {
  return <Preset autorun={{ speed: 10 }} Conductor={SnowConductor} />;
}

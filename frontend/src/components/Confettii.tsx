import { useState, useEffect } from "react";
import Conductor from "react-canvas-confetti/dist/conductor";
import Preset from "react-canvas-confetti/dist/presets";

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
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (!isVisible) return null;
  return <Preset autorun={{ speed: 10 }} Conductor={SnowConductor} />;
}

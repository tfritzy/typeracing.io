import { splitmix32 } from "./splitmix32";

export type Star = {
  x: number;
  y: number;
  z: number;
  speed: number;
};

export const generateStar = (
  rng: ReturnType<typeof splitmix32>,
  x?: number
) => {
  return {
    x: rng.next(),
    y: rng.next(),
    z: rng.next(),
    speed: 0,
  };
};

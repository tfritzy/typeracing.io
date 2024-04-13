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
  x: rng.next() * 2 - 1,
  y: rng.next() * 2 - 1,
  z: rng.next() * 0.8 + 0.2,
  speed: 0,
 };
};

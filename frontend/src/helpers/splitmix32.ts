export function splitmix32(seed: number) {
 let a = seed;

 // Generator function
 const next = () => {
  a |= 0;
  a = (a + 0x9e3779b9) | 0;
  let t = a ^ (a >>> 16);
  t = Math.imul(t, 0x21f0aaad);
  t = t ^ (t >>> 15);
  t = Math.imul(t, 0x735a2d97);
  return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
 };

 // Get the current state
 const getState = () => a;

 // Set the current state
 const setState = (newState: number) => {
  a = newState;
 };

 return {
  next,
  getState,
  setState,
 };
}
